import { useState, useEffect, useCallback, useTransition } from 'react';
import {
  SupportedLanguage,
  Direction,
  DatacenterRegion,
  HardwareFlavor,
  OsImage,
  CloudServerInstance,
  WalletTransaction,
  CdnDomain,
  StorageBucket,
} from '../types';
import { getTranslation, LANGUAGES } from '../i18n';

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
  const [balance, setBalance] = useState<number>(rawData.balance || 0);
  const [burnRate, setBurnRate] = useState<number>(rawData.burnRate || 0);
  const [remainingHours, setRemainingHours] = useState<number>(rawData.remainingHours || 0);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Catalog State
  const [regions, setRegions] = useState<DatacenterRegion[]>(rawData.initialData?.regions || [
    { id: 'ir-thr-c2', name: 'Tehran - Forough', city: 'Tehran', country: 'Iran', flag: '🇮🇷', status: 'active', latency: '12ms' },
    { id: 'ir-thr-sh1', name: 'Tehran - Shahryar', city: 'Tehran', country: 'Iran', flag: '🇮🇷', status: 'active', latency: '15ms' },
    { id: 'ir-tbz-dc1', name: 'Tabriz - Northwest', city: 'Tabriz', country: 'Iran', flag: '🇮🇷', status: 'active', latency: '18ms' },
  ]);

  const [flavors, setFlavors] = useState<HardwareFlavor[]>(rawData.initialData?.flavors || [
    { id: 'g1-1-2', name: 'Starter Eco', category: 'general', vcpus: 1, ram_mb: 2048, disk_gb: 25, hourly_cost: 300 },
    { id: 'g1-2-4', name: 'Standard General', category: 'general', vcpus: 2, ram_mb: 4096, disk_gb: 40, hourly_cost: 540, is_popular: true },
    { id: 'g1-4-8', name: 'Performance Pro', category: 'general', vcpus: 4, ram_mb: 8192, disk_gb: 60, hourly_cost: 1068 },
    { id: 'g1-8-16', name: 'Enterprise Ultra', category: 'general', vcpus: 8, ram_mb: 16384, disk_gb: 100, hourly_cost: 2100 },
    { id: 'c1-4-4', name: 'Compute Master', category: 'compute', vcpus: 4, ram_mb: 4096, disk_gb: 40, hourly_cost: 828 },
    { id: 'm1-2-8', name: 'Memory Master', category: 'memory', vcpus: 2, ram_mb: 8192, disk_gb: 50, hourly_cost: 780 },
  ]);

  const [images] = useState<OsImage[]>(rawData.initialData?.images || [
    { id: 'ubuntu-22.04', name: 'Ubuntu 22.04 LTS', distro: 'ubuntu', version: 'Jammy Jellyfish', arch: 'x86_64' },
    { id: 'ubuntu-24.04', name: 'Ubuntu 24.04 LTS', distro: 'ubuntu', version: 'Noble Numbat', arch: 'x86_64' },
    { id: 'debian-12', name: 'Debian 12 Bookworm', distro: 'debian', version: '12.5', arch: 'x86_64' },
    { id: 'almalinux-9', name: 'AlmaLinux 9 Enterprise', distro: 'almalinux', version: '9.3', arch: 'x86_64' },
    { id: 'windows-2022', name: 'Windows Server 2022', distro: 'windows', version: 'Standard RDP', arch: 'x86_64' },
  ]);

  const [servers, setServers] = useState<CloudServerInstance[]>(rawData.initialData?.servers || [
    { id: 1, name: 'production-web-01', arvan_uuid: 'srv-98f12a-thr', status: 'active', region_id: 'ir-thr-c2', flavor_id: 'g1-2-4', image_id: 'ubuntu-22.04', disk_size: 40, public_ip: '185.143.232.44', hourly_rate: 540, created_at: '2026-08-20 14:30:00' },
    { id: 2, name: 'db-redis-cache', arvan_uuid: 'srv-33b89c-tbz', status: 'active', region_id: 'ir-tbz-dc1', flavor_id: 'g1-2-4', image_id: 'ubuntu-22.04', disk_size: 40, public_ip: '185.143.235.19', hourly_rate: 540, created_at: '2026-08-20 16:15:00' },
  ]);

  const [transactions, setTransactions] = useState<WalletTransaction[]>(rawData.initialData?.transactions || [
    { id: 101, type: 'deposit', amount: 100000, balance_after: 100000, description: 'Initial Deposit / Sandbox Ref: TRX-9921', created_at: '2026-08-20 14:00:00' },
    { id: 102, type: 'hourly_charge', amount: -1080, balance_after: 98920, description: 'Automated Metering (2 active servers)', created_at: '2026-08-20 15:00:00' },
  ]);

  const [domains, setDomains] = useState<CdnDomain[]>(rawData.initialData?.domains || [
    { id: 'dom-1', domain: 'api.cloud-enterprise.ir', plan: 'Professional CDN', status: 'active', nameservers: ['ns-a.arvancdn.ir', 'ns-b.arvancdn.ir'], ssl_enabled: true },
  ]);

  const [buckets, setBuckets] = useState<StorageBucket[]>(rawData.initialData?.buckets || [
    { id: 'bkt-1', name: 'assets-media-cdn', region: 'ir-thr-c2', endpoint: 's3.ir-thr-c2.arvanstorage.ir', created_at: '2026-08-20' },
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
  }, [direction, language]);

  // Translation helper
  const t = useCallback((key: string) => {
    return getTranslation(key, language);
  }, [language]);

  // Generic WordPress AJAX caller
  const callAjax = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
    const formData = new URLSearchParams();
    formData.append('action', action);
    formData.append('nonce', rawData.nonce);
    Object.entries(data).forEach(([k, v]) => {
      formData.append(k, String(v));
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
      region: payload.region_id,
      flavor_id: payload.flavor_id,
      image_id: payload.image_id,
      disk_size: payload.disk_size,
      ssh_key: payload.ssh_key,
      password: payload.password,
    });

    if (res.success || res.data?.instance_uuid) {
      const newServer: CloudServerInstance = {
        id: Date.now(),
        name: payload.name,
        arvan_uuid: res.data?.instance_uuid || `srv-${Math.random().toString(36).substring(2, 8)}`,
        status: 'active',
        region_id: payload.region_id,
        flavor_id: payload.flavor_id,
        image_id: payload.image_id,
        disk_size: payload.disk_size,
        public_ip: res.data?.public_ip || `185.143.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 200) + 10}`,
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
    if (actionType === 'delete') {
      setServers((prev) => prev.filter((s) => s.id !== serverId));
      addToast('info', t('delete') + ': ' + t('stopped'));
      return;
    }

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

    addToast('success', t('Action completed successfully.'));
  };

  const topupWallet = async (amount: number) => {
    const res = await callAjax('arvan_topup_wallet', { amount });
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

  const registerCdn = async (domainName: string) => {
    const newDomain: CdnDomain = {
      id: `dom-${Date.now()}`,
      domain: domainName,
      plan: 'Professional Anycast CDN',
      status: 'active',
      nameservers: ['ns-a.arvancdn.ir', 'ns-b.arvancdn.ir'],
      ssl_enabled: true,
    };
    setDomains((prev) => [newDomain, ...prev]);
    addToast('success', t('connectDomain') + ': ' + domainName);
  };

  const createBucket = async (name: string) => {
    const newBucket: StorageBucket = {
      id: `bkt-${Date.now()}`,
      name,
      region: 'ir-thr-c2',
      endpoint: 's3.ir-thr-c2.arvanstorage.ir',
      created_at: new Date().toISOString().substring(0, 10),
    };
    setBuckets((prev) => [newBucket, ...prev]);
    addToast('success', t('createBucket') + ': ' + name);
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
    regions,
    flavors,
    images,
    servers,
    transactions,
    domains,
    buckets,
    toasts,
    removeToast,
    isDepositOpen,
    setIsDepositOpen,
    deployServer,
    handleServerPower,
    topupWallet,
    registerCdn,
    createBucket,
  };
}
