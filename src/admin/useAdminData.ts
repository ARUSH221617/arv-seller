import { useState, useCallback, useTransition, useEffect } from 'react';
import {
  AdminSettingsData,
  AdminKpiStats,
  AdminResourceItem,
  AdminWalletItem,
  AdminWindowData,
} from './types';
import { SupportedLanguage, Direction } from '../types';
import { getTranslation, LANGUAGES } from '../i18n';
import { ToastMessage } from '../hooks/useArvan';
import { applyThemeToDom } from '../lib/theme';

export function useAdminData() {
  const [, startTransition] = useTransition();

  const rawData: AdminWindowData = typeof window !== 'undefined' && window.arvanAdminData
    ? window.arvanAdminData
    : {
        ajaxUrl: '/wp-admin/admin-ajax.php',
        nonce: '',
        activeTab: 'settings',
        settings: {
          apiKey: '',
          sandboxMode: true,
          markupPct: 20,
          fixedMargin: 0,
          currency: 'IRT',
          defaultRegion: 'ir-thr-c2',
          storeName: 'ArvanCloud Reseller Store',
          supportEmail: 'support@cloud.local',
          supportPhone: '021-88888888',
        },
        stats: {
          total_vms: 3,
          total_active: 2,
          total_suspended: 1,
          total_mrr: 1150000,
          total_wallets: 5,
          total_credit: 420000,
          cumulative_deposits: 1850000,
          total_burn: 1430000,
        },
        resources: [
          { id: 1, user_id: 1, userName: 'admin', name: 'srv-production-web', service_type: 'ecc_server', arvan_resource_id: 'srv-98f12a', region: 'ir-thr-c2', hourly_rate: 540, status: 'active', last_metered: '2026-08-20 15:00:00' },
          { id: 2, user_id: 2, userName: 'client_corp', name: 'db-redis-cluster', service_type: 'ecc_server', arvan_resource_id: 'srv-33b89c', region: 'ir-thr-sh1', hourly_rate: 1068, status: 'active', last_metered: '2026-08-20 15:00:00' },
          { id: 3, user_id: 3, userName: 'dev_user', name: 'staging-api-01', service_type: 'ecc_server', arvan_resource_id: 'srv-77ac4d', region: 'ir-tbz-dc1', hourly_rate: 540, status: 'suspended', last_metered: '2026-08-20 14:00:00' },
        ],
        wallets: [
          { user_id: 1, userName: 'admin', userEmail: 'admin@seller.local', balance: 98920, burn_rate: 540, created_at: '2026-08-20 14:00:00' },
          { user_id: 2, userName: 'client_corp', userEmail: 'finance@corp.com', balance: 250000, burn_rate: 1068, created_at: '2026-08-19 10:00:00' },
          { user_id: 3, userName: 'dev_user', userEmail: 'dev@startup.io', balance: 0, burn_rate: 0, created_at: '2026-08-18 12:00:00' },
        ],
        activeLang: 'fa',
        direction: 'rtl',
        i18n: {},
      };

  const [language, setLangState] = useState<SupportedLanguage>(rawData.activeLang || 'fa');
  const [direction, setDirection] = useState<Direction>(rawData.direction || 'rtl');
  const [settings, setSettings] = useState<AdminSettingsData>(rawData.settings);
  const [stats, setStats] = useState<AdminKpiStats>(rawData.stats);
  const [resources, setResources] = useState<AdminResourceItem[]>(rawData.resources);
  const [wallets, setWallets] = useState<AdminWalletItem[]>(rawData.wallets);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [adjustModalUser, setAdjustModalUser] = useState<AdminWalletItem | null>(null);

  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setLanguage = useCallback((langCode: SupportedLanguage) => {
    const target = LANGUAGES.find((l) => l.code === langCode);
    const newDir = target ? target.dir : 'ltr';
    startTransition(() => {
      setLangState(langCode);
      setDirection(newDir);
    });
    document.cookie = `arvan_lang=${langCode};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.dir = newDir;
    document.documentElement.lang = langCode;
  }, []);

  // Apply brand & theme settings to the admin DOM
  useEffect(() => {
    if (settings) {
      applyThemeToDom(settings);
    }
  }, [settings]);

  const t = useCallback((key: string) => {
    return getTranslation(key, language, settings?.customTextOverrides);
  }, [language, settings?.customTextOverrides]);

  // AJAX Caller
  const callAjax = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    const formData = new URLSearchParams();
    formData.append('action', action);
    formData.append('nonce', rawData.nonce);
    Object.entries(data).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        formData.append(k, JSON.stringify(v));
      } else {
        formData.append(k, String(v));
      }
    });

    try {
      const response = await fetch(rawData.ajaxUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: formData.toString(),
      });
      return await response.json();
    } catch {
      return { success: false, data: { message: 'Network connection error.' } };
    }
  }, [rawData.ajaxUrl, rawData.nonce]);

  // 1. Test API connection
  const testApiConnection = async (apiKey: string) => {
    const res = await callAjax('arvan_test_api_connection', { api_key: apiKey });
    if (res.success) {
      addToast('success', res.data?.message || 'Connected successfully to ArvanCloud infrastructure.');
      return { success: true, message: res.data?.message };
    } else {
      addToast('error', res.data?.message || 'Failed to connect to ArvanCloud API.');
      return { success: false, message: res.data?.message };
    }
  };

  // 2. Save settings
  const saveSettings = async (newSettings: AdminSettingsData) => {
    const res = await callAjax('arvan_admin_save_settings', {
      arvan_api_key: newSettings.apiKey,
      arvan_sandbox_mode: newSettings.sandboxMode ? '1' : '0',
      arvan_markup_percentage: newSettings.markupPct,
      arvan_fixed_margin: newSettings.fixedMargin,
      arvan_currency: newSettings.currency,
      arvan_default_region: newSettings.defaultRegion,
      arvan_store_name: newSettings.storeName,
      arvan_store_tagline: newSettings.storeTagline || '',
      arvan_store_logo_url: newSettings.logoUrl || '',
      arvan_store_favicon_url: newSettings.faviconUrl || '',
      arvan_master_theme: newSettings.masterTheme || 'arvan-sorkhab',
      arvan_brand_primary_color: newSettings.brandPrimaryColor || '#008b8b',
      arvan_brand_secondary_color: newSettings.brandSecondaryColor || '#0b3a42',
      arvan_color_surface: newSettings.colorSurface || '#ffffff',
      arvan_color_bg: newSettings.colorBackground || '#f8fafc',
      arvan_color_text: newSettings.colorText || '#0f172a',
      arvan_color_text_muted: newSettings.colorTextMuted || '#64748b',
      arvan_color_border: newSettings.colorBorder || '#e2e8f0',
      arvan_color_success: newSettings.colorSuccess || '#10b981',
      arvan_color_warning: newSettings.colorWarning || '#f59e0b',
      arvan_color_error: newSettings.colorError || '#ef4444',
      arvan_font_family: newSettings.fontFamily || 'vazirmatn',
      arvan_custom_font_name: newSettings.customFontName || '',
      arvan_custom_font_url: newSettings.customFontUrl || '',
      arvan_persian_digits: newSettings.persianDigits ? '1' : '0',
      arvan_font_size_scale: newSettings.fontSizeScale || 'normal',
      arvan_base_font_size: newSettings.baseFontSize || 14,
      arvan_heading_scale: newSettings.headingScale || 1.25,
      arvan_layout_preset: newSettings.layoutPreset || 'rounded',
      arvan_border_radius: newSettings.borderRadius !== undefined ? newSettings.borderRadius : 16,
      arvan_card_elevation: newSettings.cardElevation || 'subtle',
      arvan_spacing_density: newSettings.spacingDensity || 'normal',
      arvan_container_width: newSettings.containerWidth || 'standard',
      arvan_header_style: newSettings.headerStyle || 'glassmorphic',
      arvan_text_preset: newSettings.textPreset || 'standard',
      arvan_hero_title: newSettings.heroTitle || '',
      arvan_hero_desc: newSettings.heroDescription || '',
      arvan_deploy_btn_text: newSettings.deployButtonText || '',
      arvan_dashboard_title: newSettings.dashboardTitle || '',
      arvan_dashboard_desc: newSettings.dashboardDescription || '',
      arvan_wallet_title: newSettings.walletTitle || '',
      arvan_custom_css: newSettings.customCss || '',
      arvan_show_hourly_toggle: newSettings.showHourlyToggle ? '1' : '0',
      arvan_custom_footer_text: newSettings.customFooterText || '',
      arvan_support_email: newSettings.supportEmail,
      arvan_support_phone: newSettings.supportPhone,
      arvan_custom_text_overrides: JSON.stringify(newSettings.customTextOverrides || {}),
      arvan_customization_config: JSON.stringify(newSettings),
    });

    setSettings((prev) => ({ ...prev, ...newSettings }));
    applyThemeToDom(newSettings);
    addToast('success', t('Action completed successfully.'));
    return res.success;
  };

  // 3. Emergency resource action
  const handleResourceAction = async (resourceId: number, actionType: 'power_off' | 'power_on' | 'force_delete' | 'trigger_metering') => {
    if (actionType === 'trigger_metering') {
      const res = await callAjax('arvan_admin_resource_action', {
        resource_action: 'trigger_metering',
      });
      addToast('success', res.data?.message || t('Manual metering cycle completed.'));
      return;
    }

    const res = await callAjax('arvan_admin_resource_action', {
      resource_id: resourceId,
      resource_action: actionType,
    });

    if (res && res.success) {
      if (actionType === 'force_delete') {
        setResources((prev) => prev.filter((r) => r.id !== resourceId));
        setStats((prev) => ({
          ...prev,
          total_vms: Math.max(0, prev.total_vms - 1),
          total_active: Math.max(0, prev.total_active - 1),
        }));
        addToast('info', res.data?.message || t('Instance purged by administrator.'));
      } else if (actionType === 'power_off') {
        setResources((prev) =>
          prev.map((r) => (r.id === resourceId ? { ...r, status: 'stopped' } : r))
        );
        setStats((prev) => ({
          ...prev,
          total_active: Math.max(0, prev.total_active - 1),
        }));
        addToast('warning', res.data?.message || t('Instance powered off by administrator.'));
      } else if (actionType === 'power_on') {
        setResources((prev) =>
          prev.map((r) => (r.id === resourceId ? { ...r, status: 'active' } : r))
        );
        setStats((prev) => ({
          ...prev,
          total_active: prev.total_active + 1,
        }));
        addToast('success', res.data?.message || t('Instance powered on by administrator.'));
      }
    } else {
      addToast('error', res.data?.message || t('Action failed.'));
    }
  };

  // 4. Adjust customer balance
  const adjustBalance = async (userId: number, type: 'credit' | 'debit', amount: number, reason: string) => {
    const res = await callAjax('arvan_admin_adjust_balance', {
      user_id: userId,
      type,
      amount,
      reason,
    });

    const diff = type === 'credit' ? amount : -amount;
    setWallets((prev) =>
      prev.map((w) => (w.user_id === userId ? { ...w, balance: w.balance + diff } : w))
    );
    setAdjustModalUser(null);
    addToast('success', t('Balance adjusted successfully.'));
  };

  return {
    language,
    direction,
    setLanguage,
    t,
    settings,
    stats,
    resources,
    wallets,
    toasts,
    removeToast,
    adjustModalUser,
    setAdjustModalUser,
    testApiConnection,
    saveSettings,
    handleResourceAction,
    adjustBalance,
  };
}
