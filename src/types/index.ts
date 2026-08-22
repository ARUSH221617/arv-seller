/**
 * Core TypeScript Type Definitions for ArvanCloud Reseller
 */

export type SupportedLanguage = 'fa' | 'en' | 'ar' | 'tr' | 'zh' | 'ru';
export type Direction = 'rtl' | 'ltr';
export type ActiveTab = 'server' | 'dashboard';

export interface DatacenterRegion {
  id: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  status: 'active' | 'maintenance';
  latency?: string;
  // OpenAPI v3 Standard DataCenter properties
  code?: string;
  region?: string;
  zone?: string;
  state?: 'UP' | 'PROHIBITED' | 'READ_ONLY' | 'DOWN';
  isVolumeBacked?: boolean;
}

export interface HardwareFlavor {
  id: string;
  name: string;
  category: 'general' | 'compute' | 'memory' | string;
  vcpus: number;
  ram_mb: number;
  disk_gb: number;
  hourly_cost: number;
  is_popular?: boolean;
  // OpenAPI v3 Standard Flavor Plan properties
  cpuCores?: number;
  memoryMegaBytes?: number;
  diskGigaBytes?: number;
  pricePerHour?: number;
  pricePerMonth?: number;
  generation?: string;
  type?: string;
  availabilityZone?: string;
}

export interface OsImage {
  id: string;
  name: string;
  distro: 'ubuntu' | 'debian' | 'almalinux' | 'windows' | string;
  version: string;
  arch: string;
  icon?: string;
  // OpenAPI v3 Public API Image properties
  osType?: 'LINUX' | 'WINDOWS' | string;
  osVersion?: string;
  minDiskGigaBytes?: number;
  minRamMegaBytes?: number;
  status?: 'ACTIVE' | 'QUEUED' | 'UPLOADING' | string;
  type?: 'PERSONAL' | 'PUBLIC' | string;
  availabilityZone?: string;
}

export interface CloudServerInstance {
  id: number;
  name: string;
  arvan_uuid: string;
  status: 'active' | 'suspended' | 'stopped' | 'building' | string;
  region_id: string;
  flavor_id: string;
  image_id: string;
  disk_size: number;
  public_ip: string;
  hourly_rate: number;
  created_at: string;
  // OpenAPI v3 Server Detail properties
  state?: 'ACTIVE' | 'SHUTOFF' | 'SHELVED_OFFLOADED' | 'DELETING' | string;
  taskState?: 'VOLUME_CREATING' | 'CREATING' | 'BUILD' | string;
  availabilityZone?: string;
  ipAddresses?: Array<{
    ipAddress: string;
    isPublic: boolean;
    version?: string;
    networkName?: string;
    macAddress?: string;
  }>;
}

export interface WalletTransaction {
  id: number;
  type: 'deposit' | 'hourly_charge' | 'refund' | 'admin_adjustment';
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export interface EmbedConfig {
  isEmbedded?: boolean;
  initialView?: ActiveTab;
  initialRegion?: string;
  initialFlavor?: string;
  initialImage?: string;
  initialDisk?: number;
  accentColor?: string;
  secondaryColor?: string;
  colorSurface?: string;
  colorBackground?: string;
  colorText?: string;
  colorBorder?: string;
  borderRadius?: number;
  cardElevation?: string;
  spacingDensity?: string;
  containerWidth?: string;
  fontFamily?: string;
  baseFontSize?: number;
  persianDigits?: boolean;
  ctaText?: string;
  customTitle?: string;
  customTagline?: string;
  dashboardTitle?: string;
  dashboardDescription?: string;
  walletTitle?: string;
  showHeader?: boolean;
  showRegion?: boolean;
  showStorage?: boolean;
  showOs?: boolean;
  showHourly?: boolean;
  customCss?: string;
}

export interface CustomizationSettings {
  // Master Preset
  masterTheme?: string;

  // Colors
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  colorSurface?: string;
  colorBackground?: string;
  colorText?: string;
  colorTextMuted?: string;
  colorBorder?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorError?: string;
  themeMode?: 'light' | 'dark' | 'auto';

  // Typography & Fonts
  fontFamily?: string;
  customFontName?: string;
  customFontUrl?: string;
  persianDigits?: boolean;
  fontTracking?: 'tight' | 'normal' | 'wide';

  // Font Sizes & Scale
  fontSizeScale?: 'compact' | 'normal' | 'spacious' | 'extra_large' | 'custom';
  baseFontSize?: number;
  headingScale?: number;
  lineHeightScale?: 'tight' | 'normal' | 'relaxed';

  // Layout & Shapes
  layoutPreset?: 'rounded' | 'sharp' | 'curved' | 'compact' | 'fluid' | 'custom';
  borderRadius?: number;
  cardElevation?: 'none' | 'subtle' | 'elevated' | 'glow';
  spacingDensity?: 'compact' | 'normal' | 'spacious';
  containerWidth?: 'boxed' | 'standard' | 'wide' | 'fluid';
  headerStyle?: 'glassmorphic' | 'solid' | 'minimal';

  // Texts & Content
  textPreset?: 'standard' | 'agency' | 'devops' | 'enterprise' | 'custom';
  storeName?: string;
  storeTagline?: string;
  heroTitle?: string;
  heroDescription?: string;
  deployButtonText?: string;
  dashboardTitle?: string;
  dashboardDescription?: string;
  walletTitle?: string;
  customFooterText?: string;
  customTextOverrides?: Record<string, string>;

  // Branding & Assets
  logoUrl?: string;
  faviconUrl?: string;
  supportEmail?: string;
  supportPhone?: string;
  showHourlyToggle?: boolean;
  customCss?: string;
}

export interface ArvanWindowData extends CustomizationSettings {
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
  primaryColor?: string;
  secondaryColor?: string;
  i18n?: Record<string, string>;
  initialData?: {
    regions?: DatacenterRegion[];
    flavors?: HardwareFlavor[];
    images?: OsImage[];
    servers?: CloudServerInstance[];
    transactions?: WalletTransaction[];
  };
}

declare global {
  interface Window {
    arvanData: ArvanWindowData;
  }
}

