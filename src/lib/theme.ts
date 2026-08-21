import { CustomizationSettings } from '../types';

export interface MasterThemePreset {
  id: string;
  name: string;
  category: 'vibrant' | 'corporate' | 'dark' | 'minimal' | 'modern';
  description: string;
  settings: Partial<CustomizationSettings>;
}

export interface ColorPreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  surface?: string;
  bg?: string;
  text?: string;
  border?: string;
}

export interface FontPreset {
  id: string;
  name: string;
  sub: string;
  lang: 'fa' | 'en' | 'universal';
  fontFamilyCss: string;
}

export interface FontSizePreset {
  id: 'compact' | 'normal' | 'spacious' | 'extra_large';
  name: string;
  description: string;
  baseSize: number;
  headingScale: number;
}

export interface LayoutPreset {
  id: 'rounded' | 'sharp' | 'curved' | 'compact' | 'fluid';
  name: string;
  description: string;
  radius: number;
  elevation: 'none' | 'subtle' | 'elevated' | 'glow';
  spacing: 'compact' | 'normal' | 'spacious';
  container: 'boxed' | 'standard' | 'wide' | 'fluid';
}

export interface TextPreset {
  id: 'standard' | 'agency' | 'devops' | 'enterprise';
  name: string;
  description: string;
  heroTitle: string;
  heroDescription: string;
  deployButtonText: string;
  dashboardTitle: string;
  dashboardDescription: string;
  walletTitle: string;
}

// ── 1. Master Themes (1-Click Presets) ───────────────────────────────────────
export const MASTER_THEMES: MasterThemePreset[] = [
  {
    id: 'arvan-sorkhab',
    name: 'Arvan Sorkhab Teal',
    category: 'corporate',
    description: 'Official ArvanCloud signature teal aesthetic with balanced curves & Persian typography.',
    settings: {
      masterTheme: 'arvan-sorkhab',
      brandPrimaryColor: '#008b8b',
      brandSecondaryColor: '#0b3a42',
      colorSurface: '#ffffff',
      colorBackground: '#f8fafc',
      colorText: '#0f172a',
      colorTextMuted: '#64748b',
      colorBorder: '#e2e8f0',
      fontFamily: 'vazirmatn',
      fontSizeScale: 'normal',
      baseFontSize: 14,
      headingScale: 1.25,
      layoutPreset: 'rounded',
      borderRadius: 16,
      cardElevation: 'subtle',
      spacingDensity: 'normal',
      containerWidth: 'standard',
      headerStyle: 'glassmorphic',
      textPreset: 'standard',
      heroTitle: 'سفارش سرور ابری',
      heroDescription: 'پیکربندی ماشین‌های مجازی ابری پرسرعت NVMe با سخت‌افزار دیتاسنتری ابر آروان و تحویل آنی.',
      deployButtonText: 'ایجاد و تحویل آنی سرور',
      dashboardTitle: 'داشبورد مدیریت زیرساخت',
      dashboardDescription: 'نظارت لحظه‌ای بر کیف پول اتمیک، مدیریت توان سرورها و پایش منابع ابری.',
      walletTitle: 'کیف پول و شارژ حساب',
    },
  },
  {
    id: 'royal-sapphire',
    name: 'Royal Sapphire Blue',
    category: 'modern',
    description: 'Deep cobalt sapphire palette with sleek high-tech curves & corporate precision.',
    settings: {
      masterTheme: 'royal-sapphire',
      brandPrimaryColor: '#1d4ed8',
      brandSecondaryColor: '#1e3a8a',
      colorSurface: '#ffffff',
      colorBackground: '#f0f4ff',
      colorText: '#0f172a',
      colorTextMuted: '#475569',
      colorBorder: '#cbd5e1',
      fontFamily: 'plus-jakarta',
      fontSizeScale: 'normal',
      baseFontSize: 14,
      headingScale: 1.25,
      layoutPreset: 'rounded',
      borderRadius: 14,
      cardElevation: 'subtle',
      spacingDensity: 'normal',
      containerWidth: 'standard',
      headerStyle: 'glassmorphic',
      textPreset: 'enterprise',
      heroTitle: 'Enterprise Cloud Virtual Servers',
      heroDescription: 'High-availability compute nodes deployed on Tier-3 datacenters with guaranteed SLA.',
      deployButtonText: 'Deploy Enterprise VM',
      dashboardTitle: 'Infrastructure Control Center',
      dashboardDescription: 'Real-time telemetry, server orchestration, and balance overview.',
      walletTitle: 'Prepaid Cloud Credit',
    },
  },
  {
    id: 'emerald-cyber',
    name: 'Emerald Forest DevOps',
    category: 'vibrant',
    description: 'Modern developer-centric green palette with high-density layout & rapid VM terminology.',
    settings: {
      masterTheme: 'emerald-cyber',
      brandPrimaryColor: '#059669',
      brandSecondaryColor: '#064e3b',
      colorSurface: '#ffffff',
      colorBackground: '#f0fdf4',
      colorText: '#064e3b',
      colorTextMuted: '#047857',
      colorBorder: '#bbf7d0',
      fontFamily: 'shabnam',
      fontSizeScale: 'compact',
      baseFontSize: 13,
      headingScale: 1.2,
      layoutPreset: 'compact',
      borderRadius: 10,
      cardElevation: 'subtle',
      spacingDensity: 'compact',
      containerWidth: 'wide',
      headerStyle: 'solid',
      textPreset: 'devops',
      heroTitle: 'راه‌اندازی فوری سرورهای KVM',
      heroDescription: 'زیرساخت ابری مقیاس‌پذیر، پورت ۱۰ گیگابیت، ذخیره‌سازی NVMe و دسترسی کامل Root.',
      deployButtonText: 'راه‌اندازی ماشین ابری (Deploy)',
      dashboardTitle: 'کنسول مدیریت کلاستر سرورها',
      dashboardDescription: 'نظارت بر وضعیت پورت شبکه، توان پردازشی و لاگ تراکنش‌های کیف پول.',
      walletTitle: 'اعتبار مصرف ساعتی',
    },
  },
  {
    id: 'midnight-violet',
    name: 'Midnight Dark Obsidian',
    category: 'dark',
    description: 'High-contrast cyberpunk purple & dark luxury surfaces for modern cloud dashboards.',
    settings: {
      masterTheme: 'midnight-violet',
      brandPrimaryColor: '#8b5cf6',
      brandSecondaryColor: '#6d28d9',
      colorSurface: '#ffffff',
      colorBackground: '#f5f3ff',
      colorText: '#1e1b4b',
      colorTextMuted: '#6b7280',
      colorBorder: '#ddd6fe',
      fontFamily: 'yekan',
      fontSizeScale: 'normal',
      baseFontSize: 14,
      headingScale: 1.3,
      layoutPreset: 'curved',
      borderRadius: 20,
      cardElevation: 'glow',
      spacingDensity: 'normal',
      containerWidth: 'standard',
      headerStyle: 'glassmorphic',
      textPreset: 'agency',
      heroTitle: 'سرورهای ابری اختصاصی و پرسرعت',
      heroDescription: 'مناسب برای میزبانی وب‌سایت‌های پربازدید، هوش مصنوعی، دیتابیس و اپلیکیشن‌ها.',
      deployButtonText: 'خرید و فعال‌سازی آنی',
      dashboardTitle: 'پنل کاربری اختصاصی ابر',
      dashboardDescription: 'مدیریت و کنترل منابع پردازشی، تمدید خودکار و شارژ حساب.',
      walletTitle: 'موجودی کیف پول اختصاصی',
    },
  },
  {
    id: 'crimson-rose',
    name: 'Crimson Ember Studio',
    category: 'vibrant',
    description: 'Dynamic crimson red & warm energy accents with rounded aesthetic cards.',
    settings: {
      masterTheme: 'crimson-rose',
      brandPrimaryColor: '#e11d48',
      brandSecondaryColor: '#881337',
      colorSurface: '#ffffff',
      colorBackground: '#fff1f2',
      colorText: '#1c1917',
      colorTextMuted: '#71717a',
      colorBorder: '#fecdd3',
      fontFamily: 'vazirmatn',
      fontSizeScale: 'normal',
      baseFontSize: 14,
      headingScale: 1.25,
      layoutPreset: 'rounded',
      borderRadius: 16,
      cardElevation: 'subtle',
      spacingDensity: 'normal',
      containerWidth: 'standard',
      headerStyle: 'glassmorphic',
      textPreset: 'standard',
      heroTitle: 'سفارش سرور ابری اختصاصی',
      heroDescription: 'تحویل فوری سرور لینوکس و ویندوز با آپتایم ۹۹.۹۹٪ و اتصال پرسرعت به شبکه کشور.',
      deployButtonText: 'ثبت سفارش و تحویل آنی',
      dashboardTitle: 'ناحیه کاربری سرویس‌های ابری',
      dashboardDescription: 'مدیریت متمرکز سرورهای فعال، ترافیک مصرفی و صورت‌حساب لحظه‌ای.',
      walletTitle: 'شارژ کیف پول کاربری',
    },
  },
  {
    id: 'minimal-slate',
    name: 'Nordic Slate Monochrome',
    category: 'minimal',
    description: 'Monochromatic Scandinavian minimalism, razor sharp borders, and high typographic clarity.',
    settings: {
      masterTheme: 'minimal-slate',
      brandPrimaryColor: '#0f172a',
      brandSecondaryColor: '#334155',
      colorSurface: '#ffffff',
      colorBackground: '#f8fafc',
      colorText: '#0f172a',
      colorTextMuted: '#64748b',
      colorBorder: '#e2e8f0',
      fontFamily: 'inter',
      fontSizeScale: 'normal',
      baseFontSize: 14,
      headingScale: 1.2,
      layoutPreset: 'sharp',
      borderRadius: 6,
      cardElevation: 'none',
      spacingDensity: 'compact',
      containerWidth: 'boxed',
      headerStyle: 'minimal',
      textPreset: 'standard',
      heroTitle: 'Cloud Compute Infrastructure',
      heroDescription: 'Reliable virtual servers on high performance enterprise hardware.',
      deployButtonText: 'Launch Instance',
      dashboardTitle: 'Account & Resource Overview',
      dashboardDescription: 'Manage active virtual instances and account billing.',
      walletTitle: 'Account Balance',
    },
  },
  {
    id: 'sunset-amber',
    name: 'Warm Sunset Amber',
    category: 'modern',
    description: 'Warm gold & sunset honey tones with welcoming typography and smooth shadows.',
    settings: {
      masterTheme: 'sunset-amber',
      brandPrimaryColor: '#d97706',
      brandSecondaryColor: '#78350f',
      colorSurface: '#ffffff',
      colorBackground: '#fffbeb',
      colorText: '#1c1917',
      colorTextMuted: '#78716c',
      colorBorder: '#fde68a',
      fontFamily: 'sahel',
      fontSizeScale: 'spacious',
      baseFontSize: 15,
      headingScale: 1.3,
      layoutPreset: 'curved',
      borderRadius: 22,
      cardElevation: 'elevated',
      spacingDensity: 'spacious',
      containerWidth: 'standard',
      headerStyle: 'glassmorphic',
      textPreset: 'agency',
      heroTitle: 'میزبانی ابری هوشمند و مطمئن',
      heroDescription: 'بهترین عملکرد سخت‌افزاری برای فروشگاه‌های آنلاین و سامانه‌های پرمخاطب.',
      deployButtonText: 'شروع و تحویل فوری',
      dashboardTitle: 'میز کار ابری شما',
      dashboardDescription: 'کنترل کامل سرورها، گزارش مصرف و افزایش موجودی در چند ثانیه.',
      walletTitle: 'اعتبار حساب کاربری',
    },
  },
];

// ── 2. Color Presets ────────────────────────────────────────────────────────
export const COLOR_PRESETS: ColorPreset[] = [
  { id: 'teal', name: 'Arvan Sorkhab Teal', primary: '#008b8b', secondary: '#0b3a42' },
  { id: 'sapphire', name: 'Royal Sapphire', primary: '#1d4ed8', secondary: '#1e3a8a' },
  { id: 'emerald', name: 'Emerald Forest', primary: '#059669', secondary: '#064e3b' },
  { id: 'violet', name: 'Midnight Violet', primary: '#6d28d9', secondary: '#4c1d95' },
  { id: 'crimson', name: 'Crimson Rose', primary: '#e11d48', secondary: '#881337' },
  { id: 'amber', name: 'Sunset Amber', primary: '#d97706', secondary: '#78350f' },
  { id: 'cyan', name: 'Electric Cyan', primary: '#0891b2', secondary: '#155e75' },
  { id: 'indigo', name: 'Modern Indigo', primary: '#4f46e5', secondary: '#3730a3' },
  { id: 'slate', name: 'Obsidian Slate', primary: '#0f172a', secondary: '#334155' },
  { id: 'gold', name: 'Luxury Gold', primary: '#b45309', secondary: '#713f12' },
];

// ── 3. Typography & Font Presets ────────────────────────────────────────────
export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'vazirmatn',
    name: 'Vazirmatn (وزیرمتن)',
    sub: 'Modern Persian UI Font (Default & Recommended)',
    lang: 'fa',
    fontFamilyCss: "'Vazirmatn', 'Tahoma', sans-serif",
  },
  {
    id: 'shabnam',
    name: 'Shabnam (شبنم)',
    sub: 'Clean Legible Persian Typography with Soft Curves',
    lang: 'fa',
    fontFamilyCss: "'Shabnam', 'Vazirmatn', 'Tahoma', sans-serif",
  },
  {
    id: 'yekan',
    name: 'Yekan Bakh (یکان بخ)',
    sub: 'Contemporary Geometric Persian Style',
    lang: 'fa',
    fontFamilyCss: "'Yekan Bakh', 'Yekan', 'Vazirmatn', sans-serif",
  },
  {
    id: 'sahel',
    name: 'Sahel (ساحل)',
    sub: 'Elegant Literary Persian Aesthetic',
    lang: 'fa',
    fontFamilyCss: "'Sahel', 'Vazirmatn', 'Tahoma', sans-serif",
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    sub: 'Clean Modern Western Sans-Serif',
    lang: 'en',
    fontFamilyCss: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  },
  {
    id: 'inter',
    name: 'Inter Pro',
    sub: 'High-density Screen Typography for Enterprise Dashboards',
    lang: 'en',
    fontFamilyCss: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  {
    id: 'roboto',
    name: 'Roboto Clean',
    sub: 'Material Design Standard Font',
    lang: 'universal',
    fontFamilyCss: "'Roboto', 'Plus Jakarta Sans', sans-serif",
  },
  {
    id: 'system',
    name: 'System Default',
    sub: 'Native Operating System Font Stack (-apple-system, Segoe UI)',
    lang: 'universal',
    fontFamilyCss: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  {
    id: 'custom',
    name: 'Custom Web Font (Google Font / CDN)',
    sub: 'Specify any custom web font URL or font-family name',
    lang: 'universal',
    fontFamilyCss: 'var(--arvan-custom-font-name, "Vazirmatn", sans-serif)',
  },
];

// ── 4. Font Size & Scale Presets ────────────────────────────────────────────
export const FONT_SIZE_PRESETS: FontSizePreset[] = [
  {
    id: 'compact',
    name: 'Compact (13px)',
    description: 'High data density for monitoring consoles & expert admins',
    baseSize: 13,
    headingScale: 1.18,
  },
  {
    id: 'normal',
    name: 'Standard / Balanced (14px)',
    description: 'Default balanced hierarchy across desktop & mobile',
    baseSize: 14,
    headingScale: 1.25,
  },
  {
    id: 'spacious',
    name: 'Spacious / Large (16px)',
    description: 'Generous sizing with maximized readability for storefronts',
    baseSize: 16,
    headingScale: 1.3,
  },
  {
    id: 'extra_large',
    name: 'Extra Large / Kiosk (18px)',
    description: 'High visibility typography for presentations and kiosks',
    baseSize: 18,
    headingScale: 1.35,
  },
];

// ── 5. Layout & Shape Presets ───────────────────────────────────────────────
export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'rounded',
    name: 'Modern Rounded (16px)',
    description: 'Soft 16px corner radius, standard elevation, and balanced gutters.',
    radius: 16,
    elevation: 'subtle',
    spacing: 'normal',
    container: 'standard',
  },
  {
    id: 'sharp',
    name: 'Sharp Modern (4px)',
    description: 'Minimal 4px crisp edges, flat borders, high density enterprise feel.',
    radius: 4,
    elevation: 'none',
    spacing: 'compact',
    container: 'boxed',
  },
  {
    id: 'curved',
    name: 'Ultra Curved / Pill (26px)',
    description: 'Organic 26px rounded shapes, soft glowing drop shadows.',
    radius: 26,
    elevation: 'glow',
    spacing: 'spacious',
    container: 'standard',
  },
  {
    id: 'compact',
    name: 'Compact Density (8px)',
    description: 'Tightly packed cards with 8px radius for maximum screen efficiency.',
    radius: 8,
    elevation: 'subtle',
    spacing: 'compact',
    container: 'wide',
  },
  {
    id: 'fluid',
    name: 'Fluid Full-Width (14px)',
    description: 'Spacious fluid container spanning full screen width with 14px radius.',
    radius: 14,
    elevation: 'elevated',
    spacing: 'spacious',
    container: 'fluid',
  },
];

// ── 6. Texts & Copywriting Presets ──────────────────────────────────────────
export const TEXT_PRESETS: TextPreset[] = [
  {
    id: 'standard',
    name: 'Standard Cloud Provider (ابر آروان)',
    description: 'Standard cloud server & compute terminology.',
    heroTitle: 'سفارش سرور ابری',
    heroDescription: 'پیکربندی ماشین‌های مجازی ابری پرسرعت NVMe با سخت‌افزار دیتاسنتری ابر آروان و تحویل آنی.',
    deployButtonText: 'ایجاد و تحویل آنی سرور',
    dashboardTitle: 'داشبورد مدیریت زیرساخت',
    dashboardDescription: 'نظارت لحظه‌ای بر کیف پول اتمیک، مدیریت توان سرورها و پایش منابع ابری.',
    walletTitle: 'کیف پول و شارژ حساب',
  },
  {
    id: 'agency',
    name: 'Agency & White-Label (میزبانی وب و سرور)',
    description: 'Tailored for agencies and web hosts selling servers to end clients.',
    heroTitle: 'خرید سرور مجازی ابری اختصاصی',
    heroDescription: 'سرورهای پرسرعت با ترافیک نامحدود، سخت‌افزار قدرتمند و پشتیبانی ۲۴ ساعته.',
    deployButtonText: 'خرید و تحویل فوری',
    dashboardTitle: 'ناحیه کاربری و مدیریت هاستینگ',
    dashboardDescription: 'مشاهده سرویس‌های فعال، صورت‌حساب‌ها و افزایش اعتبار حساب.',
    walletTitle: 'اعتبار حساب کاربری',
  },
  {
    id: 'devops',
    name: 'Developer & DevOps (IaaS / KVM Nodes)',
    description: 'Technical jargon for developers: Compute, Instances, IaaS, SSH Deploy.',
    heroTitle: 'راه‌اندازی فوری ماشین‌های مجازی (Instances)',
    heroDescription: 'استقرار آنی سرورهای ابری KVM با دسترسی روت، شبکه ۱۰Gbps و دیسک‌های پرسرعت NVMe.',
    deployButtonText: 'Deploy Instance Now',
    dashboardTitle: 'کنسول مدیریت کلاستر ابری',
    dashboardDescription: 'پایش تله‌متری سرورها، چرخه توان و لاگ تراکنش‌های آنی.',
    walletTitle: 'موجودی اعتباری ساعتی',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Corporate B2B (زیرساخت سازمانی)',
    description: 'Formal tone suited for large businesses and enterprise organizations.',
    heroTitle: 'سامانه یکپارچه سرورهای ابری سازمانی',
    heroDescription: 'میزبانی ابری بر بستر دیتاسنترهای استاندارد سطح ۳ با پایداری ۹۹.۹۹٪ و گواهی کیفیت.',
    deployButtonText: 'درخواست تخصیص منابع ابری',
    dashboardTitle: 'پرتال مدیریت دارایی‌های ابری',
    dashboardDescription: 'مدیریت و کنترل تخصیص منابع، گزارشات مالی و حسابداری سازمانی.',
    walletTitle: 'حساب مالی و اعتبارات سازمانی',
  },
];

// ── 7. Helper Utilities ─────────────────────────────────────────────────────
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 139, 139, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function darkenHex(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = 1 - percent / 100;
  const r = Math.max(0, Math.min(255, Math.round(rgb.r * factor)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g * factor)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b * factor)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function lightenHex(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = percent / 100;
  const r = Math.max(0, Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ── 8. CSS Variable Generator ───────────────────────────────────────────────
export function generateThemeCss(settings: CustomizationSettings): string {
  const primary = settings.brandPrimaryColor || '#008b8b';
  const secondary = settings.brandSecondaryColor || '#0b3a42';
  const surface = settings.colorSurface || '#ffffff';
  const bg = settings.colorBackground || '#f8fafc';
  const text = settings.colorText || '#0f172a';
  const textMuted = settings.colorTextMuted || '#64748b';
  const border = settings.colorBorder || '#e2e8f0';
  const success = settings.colorSuccess || '#10b981';
  const warning = settings.colorWarning || '#f59e0b';
  const error = settings.colorError || '#ef4444';

  const radius = settings.borderRadius !== undefined ? settings.borderRadius : 16;
  const baseFontSize = settings.baseFontSize || 14;
  const headingScale = settings.headingScale || 1.25;

  const h1Size = Math.round(baseFontSize * 1.7 * headingScale);
  const h2Size = Math.round(baseFontSize * 1.35 * headingScale);
  const h3Size = Math.round(baseFontSize * 1.15 * headingScale);
  const captionSize = Math.max(10, Math.round(baseFontSize * 0.85));

  const primaryHover = darkenHex(primary, 10);
  const primaryLight = lightenHex(primary, 90);
  const primaryGlow = hexToRgba(primary, 0.2);
  const secondaryGlow = hexToRgba(secondary, 0.2);

  // Spacing Scale Factor
  let spacingScale = '1';
  if (settings.spacingDensity === 'compact') spacingScale = '0.85';
  if (settings.spacingDensity === 'spacious') spacingScale = '1.18';

  // Container Max Width
  let containerMax = '1280px';
  if (settings.containerWidth === 'boxed') containerMax = '1120px';
  if (settings.containerWidth === 'wide') containerMax = '1480px';
  if (settings.containerWidth === 'fluid') containerMax = '100%';

  // Font Stack
  const fontId = settings.fontFamily || 'vazirmatn';
  const matchedFont = FONT_PRESETS.find((f) => f.id === fontId);
  const fontStack = settings.customFontName
    ? `'${settings.customFontName}', ${matchedFont?.fontFamilyCss || 'sans-serif'}`
    : matchedFont?.fontFamilyCss || "'Vazirmatn', 'Tahoma', sans-serif";

  // Elevation Shadows
  let shadow1 = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
  let shadow2 = '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)';
  let shadow3 = '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08)';

  if (settings.cardElevation === 'none') {
    shadow1 = 'none';
    shadow2 = 'none';
    shadow3 = 'none';
  } else if (settings.cardElevation === 'glow') {
    shadow1 = `0 2px 10px ${hexToRgba(primary, 0.12)}`;
    shadow2 = `0 8px 20px ${hexToRgba(primary, 0.16)}`;
    shadow3 = `0 16px 32px ${hexToRgba(primary, 0.22)}`;
  } else if (settings.cardElevation === 'elevated') {
    shadow1 = '0 2px 5px rgba(0,0,0,0.08)';
    shadow2 = '0 8px 16px rgba(0,0,0,0.1)';
    shadow3 = '0 20px 25px -5px rgba(0,0,0,0.12)';
  }

  return `
    :root, #arvan-cloud-app, #arvan-admin-root {
      --arvan-primary: ${primary};
      --arvan-primary-hover: ${primaryHover};
      --arvan-primary-light: ${primaryLight};
      --arvan-primary-glow: ${primaryGlow};
      --arvan-secondary: ${secondary};
      --arvan-secondary-glow: ${secondaryGlow};
      --arvan-teal: ${primary};
      --arvan-teal-dark: ${secondary};
      
      --arvan-surface: ${surface};
      --arvan-bg: ${bg};
      --arvan-text: ${text};
      --arvan-text-muted: ${textMuted};
      --arvan-border: ${border};
      
      --arvan-success: ${success};
      --arvan-warning: ${warning};
      --arvan-error: ${error};
      
      --arvan-radius: ${radius}px;
      --arvan-radius-sm: ${Math.max(2, Math.round(radius * 0.5))}px;
      --arvan-radius-lg: ${Math.round(radius * 1.5)}px;
      --radius: ${radius}px;
      
      --arvan-font-size-base: ${baseFontSize}px;
      --arvan-font-size-h1: ${h1Size}px;
      --arvan-font-size-h2: ${h2Size}px;
      --arvan-font-size-h3: ${h3Size}px;
      --arvan-font-size-caption: ${captionSize}px;
      
      --arvan-font-family: ${fontStack};
      --arvan-spacing-scale: ${spacingScale};
      --arvan-container-max: ${containerMax};
      
      --arvan-shadow-1: ${shadow1};
      --arvan-shadow-2: ${shadow2};
      --arvan-shadow-3: ${shadow3};
    }

    #arvan-cloud-app, #arvan-admin-root {
      font-family: var(--arvan-font-family) !important;
      background-color: var(--arvan-bg) !important;
      color: var(--arvan-text) !important;
    }

    #arvan-cloud-app *, #arvan-admin-root * {
      font-family: inherit;
    }

    /* Container Max Width Architecture */
    #arvan-cloud-app .container,
    #arvan-admin-root .container,
    .arvan-container {
      max-width: var(--arvan-container-max, 1280px) !important;
      width: 100% !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }

    /* Dynamic Border Radius Cascade */
    #arvan-cloud-app .rounded-3xl,
    #arvan-admin-root .rounded-3xl,
    #arvan-cloud-app [class*="rounded-3xl"],
    #arvan-admin-root [class*="rounded-3xl"] {
      border-radius: calc(var(--arvan-radius, 16px) * 1.65) !important;
    }
    #arvan-cloud-app .rounded-2xl,
    #arvan-admin-root .rounded-2xl,
    #arvan-cloud-app [class*="rounded-2xl"],
    #arvan-admin-root [class*="rounded-2xl"] {
      border-radius: calc(var(--arvan-radius, 16px) * 1.35) !important;
    }
    #arvan-cloud-app .rounded-xl,
    #arvan-admin-root .rounded-xl,
    #arvan-cloud-app [class*="rounded-xl"],
    #arvan-admin-root [class*="rounded-xl"] {
      border-radius: calc(var(--arvan-radius, 16px) * 1.0) !important;
    }
    #arvan-cloud-app .rounded-lg,
    #arvan-admin-root .rounded-lg,
    #arvan-cloud-app [class*="rounded-lg"],
    #arvan-admin-root [class*="rounded-lg"] {
      border-radius: calc(var(--arvan-radius, 16px) * 0.7) !important;
    }
    #arvan-cloud-app .rounded-md,
    #arvan-admin-root .rounded-md,
    #arvan-cloud-app [class*="rounded-md"],
    #arvan-admin-root [class*="rounded-md"] {
      border-radius: calc(var(--arvan-radius, 16px) * 0.5) !important;
    }

    /* Dynamic Elevation Shadows */
    #arvan-cloud-app .m3-elevation-1,
    #arvan-admin-root .m3-elevation-1 {
      box-shadow: var(--arvan-shadow-1) !important;
    }
    #arvan-cloud-app .m3-elevation-2,
    #arvan-admin-root .m3-elevation-2 {
      box-shadow: var(--arvan-shadow-2) !important;
    }
    #arvan-cloud-app .m3-elevation-3,
    #arvan-admin-root .m3-elevation-3 {
      box-shadow: var(--arvan-shadow-3) !important;
    }

    /* Dynamic Spacing Density */
    #arvan-cloud-app .p-6, #arvan-admin-root .p-6 {
      padding: calc(1.5rem * var(--arvan-spacing-scale, 1)) !important;
    }
    #arvan-cloud-app .p-5, #arvan-admin-root .p-5 {
      padding: calc(1.25rem * var(--arvan-spacing-scale, 1)) !important;
    }
    #arvan-cloud-app .p-4, #arvan-admin-root .p-4 {
      padding: calc(1rem * var(--arvan-spacing-scale, 1)) !important;
    }
    #arvan-cloud-app .space-y-6 > :not([hidden]) ~ :not([hidden]),
    #arvan-admin-root .space-y-6 > :not([hidden]) ~ :not([hidden]) {
      margin-top: calc(1.5rem * var(--arvan-spacing-scale, 1)) !important;
    }
    #arvan-cloud-app .space-y-8 > :not([hidden]) ~ :not([hidden]),
    #arvan-admin-root .space-y-8 > :not([hidden]) ~ :not([hidden]) {
      margin-top: calc(2rem * var(--arvan-spacing-scale, 1)) !important;
    }
    #arvan-cloud-app .gap-6, #arvan-admin-root .gap-6 {
      gap: calc(1.5rem * var(--arvan-spacing-scale, 1)) !important;
    }
    #arvan-cloud-app .gap-8, #arvan-admin-root .gap-8 {
      gap: calc(2rem * var(--arvan-spacing-scale, 1)) !important;
    }

    .arvan-theme-card {
      background-color: var(--arvan-surface) !important;
      border-color: var(--arvan-border) !important;
      border-radius: var(--arvan-radius) !important;
      box-shadow: var(--arvan-shadow-1) !important;
    }

    .arvan-theme-primary-btn {
      background-color: var(--arvan-primary) !important;
      color: #ffffff !important;
      border-radius: var(--arvan-radius) !important;
    }
    .arvan-theme-primary-btn:hover {
      background-color: var(--arvan-primary-hover) !important;
    }

    .arvan-theme-badge-active {
      background-color: var(--arvan-primary-light) !important;
      color: var(--arvan-primary) !important;
      border-color: var(--arvan-primary) !important;
    }

    /* Header Architecture Styles */
    .arvan-header-glassmorphic {
      backdrop-filter: blur(16px);
      background-color: var(--arvan-surface) !important;
      border-bottom: 1px solid var(--arvan-border) !important;
    }
    .arvan-header-solid {
      background-color: var(--arvan-surface) !important;
      border-bottom: 2px solid var(--arvan-border) !important;
      box-shadow: var(--arvan-shadow-1) !important;
    }
    .arvan-header-minimal {
      background-color: transparent !important;
      border-bottom: 1px solid var(--arvan-border) !important;
    }
    .arvan-header-floating {
      margin: 12px auto !important;
      max-width: calc(var(--arvan-container-max, 1280px) - 24px) !important;
      border-radius: var(--arvan-radius, 16px) !important;
      border: 1px solid var(--arvan-border) !important;
      box-shadow: var(--arvan-shadow-2) !important;
      background-color: var(--arvan-surface) !important;
    }

    /* Buttons & Nav Color Token Reactivity */
    #arvan-cloud-app .bg-arvan-teal,
    #arvan-admin-root .bg-arvan-teal {
      background-color: var(--arvan-primary) !important;
    }
    #arvan-cloud-app .text-arvan-teal,
    #arvan-admin-root .text-arvan-teal {
      color: var(--arvan-primary) !important;
    }
    #arvan-cloud-app .border-arvan-teal,
    #arvan-admin-root .border-arvan-teal {
      border-color: var(--arvan-primary) !important;
    }
    #arvan-cloud-app .ring-arvan-teal,
    #arvan-admin-root .ring-arvan-teal {
      --tw-ring-color: var(--arvan-primary) !important;
    }
    #arvan-cloud-app .hover\\:bg-arvan-teal-dark:hover,
    #arvan-admin-root .hover\\:bg-arvan-teal-dark:hover {
      background-color: var(--arvan-primary-hover) !important;
    }

    ${settings.customCss || ''}
  `;
}

// ── 9. Live Theme Applier to DOM ────────────────────────────────────────────
export function applyThemeToDom(settings: CustomizationSettings): void {
  if (typeof document === 'undefined') return;

  // 1. Dynamic style tag
  let styleEl = document.getElementById('arvan-theme-vars') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'arvan-theme-vars';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = generateThemeCss(settings);

  // 2. Custom Web Font Link
  if (settings.customFontUrl) {
    let fontLinkEl = document.getElementById('arvan-custom-webfont-link') as HTMLLinkElement | null;
    if (!fontLinkEl) {
      fontLinkEl = document.createElement('link');
      fontLinkEl.id = 'arvan-custom-webfont-link';
      fontLinkEl.rel = 'stylesheet';
      document.head.appendChild(fontLinkEl);
    }
    if (fontLinkEl.href !== settings.customFontUrl) {
      fontLinkEl.href = settings.customFontUrl;
    }
  }

  // 3. Favicon update
  if (settings.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }

  // 4. Update font class on html
  const fontId = settings.fontFamily || 'vazirmatn';
  const allFontClasses = ['font-vazirmatn', 'font-shabnam', 'font-yekan', 'font-sahel', 'font-plus-jakarta', 'font-inter', 'font-roboto', 'font-system', 'font-custom'];
  allFontClasses.forEach((cls) => document.documentElement.classList.remove(cls));
  document.documentElement.classList.add(`font-${fontId}`);
}

// ── 10. Default Settings Factory ────────────────────────────────────────────
export function getDefaultCustomizationSettings(): CustomizationSettings {
  const defaultMaster = MASTER_THEMES[0];
  return {
    ...defaultMaster.settings,
    storeName: 'ArvanCloud Reseller',
    storeTagline: 'High Performance Cloud Computing & NVMe Storage',
    logoUrl: '',
    faviconUrl: '',
    supportEmail: 'support@cloud.local',
    supportPhone: '021-88888888',
    showHourlyToggle: true,
    customCss: '',
    customTextOverrides: {},
  };
}
