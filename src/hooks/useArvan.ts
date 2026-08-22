import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  SupportedLanguage,
  Direction,
  DatacenterRegion,
  HardwareFlavor,
  OsImage,
  CloudServerInstance,
  WalletTransaction,
} from '../types';
import { getTranslation, LANGUAGES } from '../i18n';
import { applyThemeToDom } from '../lib/theme';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export function useArvan() {
  const [, startTransition] = useTransition();

  // 1. Initial State from window.arvanData
  const rawData = typeof window !== 'undefined' && window.arvanData ? window.arvanData : {
    ajaxUrl: '/wp-admin/admin-ajax.php',
    nonce: '',
    currency: 'IRT' as const,
    userId: 1,
    isLogged: true,
    balance: 100000,
    burnRate: 1080,
    remainingHours: 92.5,
    markupPct: 20,
    fixedMargin: 0,
    activeLang: 'fa' as SupportedLanguage,
    direction: 'rtl' as Direction,
    loginUrl: '/wp-login.php',
  };

  const [language, setLangState] = useState<SupportedLanguage>(rawData.activeLang || 'fa');
  const [direction, setDirection] = useState<Direction>(rawData.direction || 'rtl');
  const [balance, setBalance] = useState<number>(Number(rawData.balance) || 0);
  const [burnRate, setBurnRate] = useState<number>(Number(rawData.burnRate) || 0);
  const [remainingHours, setRemainingHours] = useState<number>(Number(rawData.remainingHours) || 0);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ── Apply complete theme settings from window.arvanData ───────────────────
  useEffect(() => {
    applyThemeToDom(rawData);
  }, []);

  // Translation helper with admin string overrides support
  const t = useCallback((key: string) => {
    return getTranslation(key, language, rawData.customTextOverrides);
  }, [language]);


  // Catalog State
  const [regions] = useState<DatacenterRegion[]>(rawData.initialData?.regions || [
    { id: 'ir-thr-ba1', code: 'ir-thr-ba1', zone: 'ir-thr-ba1', region: 'ir-central1', name: 'Bamdad (Tehran)', city: 'Tehran', country: 'Iran', flag: '🇮🇷', status: 'active', state: 'UP', isVolumeBacked: true, latency: '12ms' },
    { id: 'ir-thr-sh1', code: 'ir-thr-sh1', zone: 'ir-thr-sh1', region: 'ir-central1', name: 'Shahryar (Tehran)', city: 'Tehran', country: 'Iran', flag: '🇮🇷', status: 'active', state: 'UP', isVolumeBacked: true, latency: '15ms' },
    { id: 'ir-tbz-sh1', code: 'ir-tbz-sh1', zone: 'ir-tbz-sh1', region: 'ir-northwest1', name: 'Shahriar (Tabriz)', city: 'Tabriz', country: 'Iran', flag: '🇮🇷', status: 'active', state: 'UP', isVolumeBacked: true, latency: '18ms' },
    { id: 'ir-central1-a', code: 'ir-central1-a', zone: 'ir-central1-a', region: 'ir-central1', name: 'Forough (Central)', city: 'Tehran', country: 'Iran', flag: '🇮🇷', status: 'active', state: 'UP', isVolumeBacked: true, latency: '14ms' },
  ]);

  const [flavors] = useState<HardwareFlavor[]>(rawData.initialData?.flavors || [
    { id: 'g2-1-2-0', name: 'Starter Eco G2', category: 'general', vcpus: 1, ram_mb: 2048, disk_gb: 25, hourly_cost: 300, cpuCores: 1, memoryMegaBytes: 2048, diskGigaBytes: 25, pricePerHour: 250, pricePerMonth: 180000, generation: 'G2', type: 'STANDARD' },
    { id: 'g1-1-2', name: 'General 1C-2G', category: 'general', vcpus: 1, ram_mb: 2048, disk_gb: 25, hourly_cost: 300, cpuCores: 1, memoryMegaBytes: 2048, diskGigaBytes: 25, pricePerHour: 250, pricePerMonth: 180000, generation: 'G1', type: 'STANDARD' },
    { id: 'g1-2-4', name: 'Standard General', category: 'general', vcpus: 2, ram_mb: 4096, disk_gb: 40, hourly_cost: 540, is_popular: true, cpuCores: 2, memoryMegaBytes: 4096, diskGigaBytes: 40, pricePerHour: 450, pricePerMonth: 324000, generation: 'G2', type: 'STANDARD' },
    { id: 'g1-4-8', name: 'Performance Pro', category: 'general', vcpus: 4, ram_mb: 8192, disk_gb: 60, hourly_cost: 1068, cpuCores: 4, memoryMegaBytes: 8192, diskGigaBytes: 60, pricePerHour: 890, pricePerMonth: 640800, generation: 'G2', type: 'STANDARD' },
    { id: 'g1-8-16', name: 'Enterprise Ultra', category: 'general', vcpus: 8, ram_mb: 16384, disk_gb: 100, hourly_cost: 2100, cpuCores: 8, memoryMegaBytes: 16384, diskGigaBytes: 100, pricePerHour: 1750, pricePerMonth: 1260000, generation: 'G2', type: 'STANDARD' },
    { id: 'c1-4-4', name: 'Compute Master', category: 'compute', vcpus: 4, ram_mb: 4096, disk_gb: 40, hourly_cost: 828, cpuCores: 4, memoryMegaBytes: 4096, diskGigaBytes: 40, pricePerHour: 690, pricePerMonth: 496800, generation: 'C1', type: 'COMPUTE' },
    { id: 'm1-2-8', name: 'Memory Master', category: 'memory', vcpus: 2, ram_mb: 8192, disk_gb: 50, hourly_cost: 780, cpuCores: 2, memoryMegaBytes: 8192, diskGigaBytes: 50, pricePerHour: 650, pricePerMonth: 468000, generation: 'M1', type: 'MEMORY' },
  ]);

  const [images] = useState<OsImage[]>(rawData.initialData?.images || [
    { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', distro: 'ubuntu', version: 'Jammy Jellyfish', arch: 'x86_64', osType: 'LINUX', osVersion: '22.04', minDiskGigaBytes: 20, minRamMegaBytes: 1024, status: 'ACTIVE', type: 'PUBLIC' },
    { id: 'ubuntu-24.04', name: 'Ubuntu 24.04 LTS', distro: 'ubuntu', version: 'Noble Numbat', arch: 'x86_64', osType: 'LINUX', osVersion: '24.04', minDiskGigaBytes: 20, minRamMegaBytes: 1024, status: 'ACTIVE', type: 'PUBLIC' },
    { id: 'debian-12', name: 'Debian 12 Bookworm', distro: 'debian', version: '12.5', arch: 'x86_64', osType: 'LINUX', osVersion: '12', minDiskGigaBytes: 20, minRamMegaBytes: 1024, status: 'ACTIVE', type: 'PUBLIC' },
    { id: 'almalinux-9', name: 'AlmaLinux 9 Enterprise', distro: 'almalinux', version: '9.3', arch: 'x86_64', osType: 'LINUX', osVersion: '9', minDiskGigaBytes: 20, minRamMegaBytes: 1024, status: 'ACTIVE', type: 'PUBLIC' },
    { id: 'windows-server-2022', name: 'Windows Server 2022', distro: 'windows', version: 'Standard RDP', arch: 'x86_64', osType: 'WINDOWS', osVersion: '2022', minDiskGigaBytes: 40, minRamMegaBytes: 2048, status: 'ACTIVE', type: 'PUBLIC' },
  ]);

  const [servers, setServers] = useState<CloudServerInstance[]>(rawData.initialData?.servers || [
    { id: 1, name: 'production-web-01', arvan_uuid: 'srv-98f12a-thr', status: 'active', state: 'ACTIVE', region_id: 'ir-thr-ba1', availabilityZone: 'ir-thr-ba1', flavor_id: 'g1-2-4', image_id: 'ubuntu-22.04', disk_size: 40, public_ip: '185.143.232.44', hourly_rate: 540, created_at: '2026-08-20 14:30:00' },
    { id: 2, name: 'db-redis-cache', arvan_uuid: 'srv-33b89c-tbz', status: 'active', state: 'ACTIVE', region_id: 'ir-tbz-sh1', availabilityZone: 'ir-tbz-sh1', flavor_id: 'g1-2-4', image_id: 'ubuntu-22.04', disk_size: 40, public_ip: '185.143.235.19', hourly_rate: 540, created_at: '2026-08-20 16:15:00' },
  ]);

  const [transactions, setTransactions] = useState<WalletTransaction[]>(rawData.initialData?.transactions || [
    { id: 101, type: 'deposit', amount: 100000, balance_after: 100000, description: 'Initial Deposit / Sandbox Ref: TRX-9921', created_at: '2026-08-20 14:00:00' },
    { id: 102, type: 'hourly_charge', amount: -1080, balance_after: 98920, description: 'Automated Metering (2 active servers)', created_at: '2026-08-20 15:00:00' },
  ]);

  // Add Toast Notification
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

  // Language Switcher
  const setLanguage = useCallback((langCode: SupportedLanguage) => {
    const target = LANGUAGES.find((l) => l.code === langCode);
    const newDir = target ? target.dir : 'ltr';
    startTransition(() => {
      setLangState(langCode);
      setDirection(newDir);
    });

    // Set cookie
    document.cookie = `arvan_lang=${langCode};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.dir = newDir;
    document.documentElement.lang = langCode;
  }, []);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    document.documentElement.classList.remove('lang-fa', 'lang-en', 'lang-ar', 'lang-tr', 'lang-zh', 'lang-ru', 'is-rtl', 'is-ltr');
    document.documentElement.classList.add(`lang-${language}`, `is-${direction}`);
  }, [direction, language]);

  // Generic WordPress AJAX caller
  const callAjax = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    const formData = new URLSearchParams();
    formData.append('action', action);
    formData.append('nonce', rawData.nonce);
    Object.entries(data).forEach(([k, v]) => {
      if (typeof v === 'object' && v !== null) {
        formData.append(k, JSON.stringify(v));
      } else {
        formData.append(k, String(v ?? ''));
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

  // Actions
  const deployServer = async (payload: { name: string; region_id: string; flavor_id: string; image_id: string; disk_size: number; ssh_key?: string; password?: string }) => {
    const selectedFlavor = flavors.find((f) => f.id === payload.flavor_id) || flavors[0];
    const cost = selectedFlavor.hourly_cost;

    const res = await callAjax('arvan_deploy_server', {
      name: payload.name,
      availabilityZone: payload.region_id,
      region: payload.region_id,
      flavorId: payload.flavor_id,
      flavor_id: payload.flavor_id,
      imageId: payload.image_id,
      image_id: payload.image_id,
      rootVolumeSizeGigaBytes: payload.disk_size,
      disk_size: payload.disk_size,
      sshKeyName: payload.ssh_key,
      ssh_key: payload.ssh_key,
      password: payload.password,
    });

    if (res.success || res.data?.instance_uuid || res.data?.resource_id) {
      const assignedIp = res.data?.ip_address || res.data?.public_ip || `185.143.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`;
      const newServer: CloudServerInstance = {
        id: res.data?.resource_id || Date.now(),
        name: payload.name,
        arvan_uuid: res.data?.arvan_id || res.data?.instance_uuid || `srv-${Math.random().toString(36).substring(2, 8)}`,
        status: 'active',
        state: 'ACTIVE',
        region_id: payload.region_id,
        availabilityZone: payload.region_id,
        flavor_id: payload.flavor_id,
        image_id: payload.image_id,
        disk_size: payload.disk_size,
        public_ip: assignedIp,
        hourly_rate: cost,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setServers((prev) => [newServer, ...prev]);
      setBurnRate((prev) => prev + cost);
      addToast('success', t('instantDeploy') + ': ' + newServer.name + ' (' + newServer.public_ip + ')');
      return true;
    } else {
      if (res.data?.insufficient_funds) {
        setIsDepositOpen(true);
      }
      addToast('error', res.data?.message || t('Failed to deploy server.'));
      return false;
    }
  };

  const handleServerPower = async (serverId: number, actionType: 'power_on' | 'power_off' | 'reboot' | 'delete') => {
    const powerAction = actionType.replace('_', '-'); // e.g. power-on, power-off, reboot, delete
    const res = await callAjax('arvan_server_power', {
      resource_id: serverId,
      power_action: powerAction,
    });

    if (res && res.success) {
      if (actionType === 'delete') {
        setServers((prev) => prev.filter((s) => s.id !== serverId));
        addToast('info', res.data?.message || (t('delete') + ': ' + t('stopped')));
      } else {
        setServers((prev) =>
          prev.map((s) => {
            if (s.id === serverId) {
              if (actionType === 'power_off') return { ...s, status: 'stopped' };
              if (actionType === 'power_on') return { ...s, status: 'active' };
              if (actionType === 'reboot') return { ...s, status: 'active' };
            }
            return s;
          })
        );
        addToast('success', res.data?.message || t('Action completed successfully.'));
      }
    } else {
      addToast('error', res.data?.message || t('Action failed.'));
    }
  };

  // Real-time synchronization for customer dashboard
  const refreshDashboardData = useCallback(async () => {
    if (!rawData.isLogged) return;
    const res = await callAjax('arvan_get_dashboard_data');
    if (res && res.success && res.data) {
      if (typeof res.data.balance === 'number') setBalance(res.data.balance);
      if (typeof res.data.burnRate === 'number') setBurnRate(res.data.burnRate);
      if (typeof res.data.remainingHours === 'number') setRemainingHours(res.data.remainingHours);
      if (Array.isArray(res.data.servers)) setServers(res.data.servers);
    }
  }, [callAjax, rawData.isLogged]);

  // Periodic polling every 10 seconds to sync server lifecycle state changes
  useEffect(() => {
    if (!rawData.isLogged) return;
    const interval = setInterval(() => {
      refreshDashboardData();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshDashboardData, rawData.isLogged]);

  const topupWallet = async (amount: number) => {
    await callAjax('arvan_topup_wallet', { amount });
    const depositAmount = Number(amount);
    setBalance((prev) => prev + depositAmount);
    setTransactions((prev) => [
      {
        id: Date.now(),
        type: 'deposit',
        amount: depositAmount,
        balance_after: balance + depositAmount,
        description: `${t('txDeposit')}: ${depositAmount.toLocaleString()} ${rawData.currency} (Ref: TRX-${Math.floor(Math.random() * 90000) + 10000})`,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      },
      ...prev,
    ]);
    setIsDepositOpen(false);
    addToast('success', t('topUp') + ' + ' + depositAmount.toLocaleString() + ' ' + rawData.currency);
  };

  return {
    language,
    direction,
    setLanguage,
    t,
    balance,
    burnRate,
    remainingHours,
    currency: rawData.currency,
    userId: rawData.userId,
    isLogged: rawData.isLogged,
    loginUrl: rawData.loginUrl,
    // Brand / customization (read from window.arvanData → admin settings)
    storeName: rawData.storeName || '',
    storeTagline: rawData.storeTagline || '',
    heroTitle: rawData.heroTitle || '',
    heroDescription: rawData.heroDescription || '',
    deployButtonText: rawData.deployButtonText || '',
    dashboardTitle: rawData.dashboardTitle || '',
    dashboardDescription: rawData.dashboardDescription || '',
    walletTitle: rawData.walletTitle || '',
    logoUrl: rawData.logoUrl || '',
    primaryColor: rawData.brandPrimaryColor || rawData.primaryColor || '#008b8b',
    showHourlyToggle: rawData.showHourlyToggle !== false,
    customFooterText: rawData.customFooterText || '',
    containerWidth: rawData.containerWidth || 'standard',
    headerStyle: rawData.headerStyle || 'glassmorphic',
    regions,
    flavors,
    images,
    servers,
    transactions,
    toasts,
    removeToast,
    isDepositOpen,
    setIsDepositOpen,
    deployServer,
    handleServerPower,
    topupWallet,
  };
}
