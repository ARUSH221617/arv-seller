import { SupportedLanguage, Direction, CustomizationSettings } from '../types';

export interface AdminSettingsData extends CustomizationSettings {
  apiKey: string;
  hasApiKey?: boolean;
  sandboxMode: boolean;
  markupPct: number;
  fixedMargin: number;
  currency: 'IRT' | 'IRR' | 'USD';
  defaultRegion: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
}

export interface AdminResourceItem {
  id: number;
  user_id: number;
  userName: string;
  userEmail?: string;
  name: string;
  service_type: string;
  arvan_resource_id: string;
  region: string;
  hourly_rate: number;
  status: 'active' | 'suspended' | 'stopped';
  last_metered: string;
}

export interface AdminWalletItem {
  user_id: number;
  userName: string;
  userEmail: string;
  balance: number;
  burn_rate: number;
  created_at: string;
}

export interface AdminKpiStats {
  total_vms: number;
  total_active: number;
  total_suspended: number;
  total_mrr: number;
  total_wallets: number;
  total_credit: number;
  cumulative_deposits: number;
  total_burn: number;
}

export interface AdminWindowData {
  ajaxUrl: string;
  nonce: string;
  activeTab: 'settings' | 'customization' | 'resources' | 'wallets';
  settings: AdminSettingsData;
  stats: AdminKpiStats;
  resources: AdminResourceItem[];
  wallets: AdminWalletItem[];
  activeLang: SupportedLanguage;
  direction: Direction;
  i18n: Record<string, string>;
}

declare global {
  interface Window {
    arvanAdminData: AdminWindowData;
  }
}
