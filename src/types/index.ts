/**
 * Core TypeScript Type Definitions for ArvanCloud Reseller
 */

export type SupportedLanguage = 'fa' | 'en' | 'ar' | 'tr' | 'zh' | 'ru';
export type Direction = 'rtl' | 'ltr';
export type ActiveTab = 'server' | 'dashboard' | 'cdn' | 'storage';

export interface DatacenterRegion {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  status: 'active' | 'maintenance';
  latency?: string;
}

export interface HardwareFlavor {
  id: string;
  name: string;
  category: 'general' | 'compute' | 'memory';
  vcpus: number;
  ram_mb: number;
  disk_gb: number;
  hourly_cost: number;
  is_popular?: boolean;
}

export interface OsImage {
  id: string;
  name: string;
  distro: 'ubuntu' | 'debian' | 'almalinux' | 'windows';
  version: string;
  arch: string;
  icon?: string;
}

export interface CloudServerInstance {
  id: number;
  name: string;
  arvan_uuid: string;
  status: 'active' | 'suspended' | 'stopped' | 'building';
  region_id: string;
  flavor_id: string;
  image_id: string;
  disk_size: number;
  public_ip: string;
  hourly_rate: number;
  created_at: string;
}

export interface WalletTransaction {
  id: number;
  type: 'deposit' | 'hourly_charge' | 'refund' | 'admin_adjustment';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface CdnDomain {
  id: string;
  domain: string;
  plan: string;
  status: 'active' | 'pending' | 'suspended';
  nameservers: string[];
  ssl_enabled: boolean;
}

export interface DnsRecord {
  id: string;
  domain_id: string;
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  value: string;
  ttl: number;
  cloud_proxied: boolean;
}

export interface StorageBucket {
  id: string;
  name: string;
  region: string;
  endpoint: string;
  created_at: string;
}

export interface S3Credentials {
  access_key: string;
  secret_key: string;
  endpoint: string;
}

export interface ArvanWindowData {
  ajaxUrl: string;
  nonce: string;
  currency: 'IRT' | 'IRR' | 'USD';
  userId: number;
  isLogged: boolean;
  balance: number;
  burnRate: number;
  remainingHours: number;
  markupPct: number;
  fixedMargin: number;
  activeLang: SupportedLanguage;
  direction: Direction;
  loginUrl: string;
  storeName?: string;
  supportEmail?: string;
  supportPhone?: string;
  i18n?: Record<string, string>;
  initialData?: {
    regions?: DatacenterRegion[];
    flavors?: HardwareFlavor[];
    images?: OsImage[];
    servers?: CloudServerInstance[];
    transactions?: WalletTransaction[];
    domains?: CdnDomain[];
    buckets?: StorageBucket[];
  };
}

declare global {
  interface Window {
    arvanData: ArvanWindowData;
  }
}
