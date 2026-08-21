import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette,
  Image as ImageIcon,
  Type,
  Sliders,
  Code2,
  Save,
  CheckCircle2,
  Copy,
  Sparkles,
  Layers,
  Server,
  Monitor,
  Smartphone,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  HelpCircle,
  Search,
  Check,
  Layout,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { AdminSettingsData } from '../types';
import { SupportedLanguage } from '../../types';
import { cn } from '../../lib/utils';
import {
  MASTER_THEMES,
  COLOR_PRESETS,
  FONT_PRESETS,
  FONT_SIZE_PRESETS,
  LAYOUT_PRESETS,
  TEXT_PRESETS,
  applyThemeToDom,
  getDefaultCustomizationSettings,
  MasterThemePreset,
} from '../../lib/theme';
import { getCustomizableKeys } from '../../i18n';

interface AdminCustomizationViewProps {
  settings: AdminSettingsData;
  language: SupportedLanguage;
  t: (key: string) => string;
  onSave: (updated: AdminSettingsData) => Promise<boolean>;
}

type StudioTab = 'master' | 'colors' | 'typography' | 'layout' | 'texts' | 'css' | 'integration';
type PreviewMode = 'configurator' | 'dashboard' | 'admin';
type PreviewDevice = 'desktop' | 'mobile';

export const AdminCustomizationView: React.FC<AdminCustomizationViewProps> = ({
  settings,
  language,
  t,
  onSave,
}) => {
  const [formData, setFormData] = useState<AdminSettingsData>({
    ...settings,
    masterTheme: settings.masterTheme || 'arvan-sorkhab',
    brandPrimaryColor: settings.brandPrimaryColor || '#008b8b',
    brandSecondaryColor: settings.brandSecondaryColor || '#0b3a42',
    colorSurface: settings.colorSurface || '#ffffff',
    colorBackground: settings.colorBackground || '#f8fafc',
    colorText: settings.colorText || '#0f172a',
    colorTextMuted: settings.colorTextMuted || '#64748b',
    colorBorder: settings.colorBorder || '#e2e8f0',
    colorSuccess: settings.colorSuccess || '#10b981',
    colorWarning: settings.colorWarning || '#f59e0b',
    colorError: settings.colorError || '#ef4444',
    fontFamily: settings.fontFamily || 'vazirmatn',
    customFontName: settings.customFontName || '',
    customFontUrl: settings.customFontUrl || '',
    persianDigits: settings.persianDigits ?? true,
    fontSizeScale: settings.fontSizeScale || 'normal',
    baseFontSize: settings.baseFontSize || 14,
    headingScale: settings.headingScale || 1.25,
    layoutPreset: settings.layoutPreset || 'rounded',
    borderRadius: settings.borderRadius !== undefined ? settings.borderRadius : 16,
    cardElevation: settings.cardElevation || 'subtle',
    spacingDensity: settings.spacingDensity || 'normal',
    containerWidth: settings.containerWidth || 'standard',
    headerStyle: settings.headerStyle || 'glassmorphic',
    textPreset: settings.textPreset || 'standard',
    storeName: settings.storeName || 'ArvanCloud Reseller',
    storeTagline: settings.storeTagline || 'High Performance Cloud Computing & NVMe Storage',
    heroTitle: settings.heroTitle || 'سفارش سرور ابری',
    heroDescription: settings.heroDescription || 'پیکربندی ماشین‌های مجازی ابری پرسرعت NVMe با سخت‌افزار دیتاسنتری ابر آروان و تحویل آنی.',
    deployButtonText: settings.deployButtonText || 'ایجاد و تحویل آنی سرور',
    dashboardTitle: settings.dashboardTitle || 'داشبورد مدیریت زیرساخت',
    dashboardDescription: settings.dashboardDescription || 'نظارت لحظه‌ای بر کیف پول اتمیک، مدیریت توان سرورها و پایش منابع ابری.',
    walletTitle: settings.walletTitle || 'کیف پول و شارژ حساب',
    logoUrl: settings.logoUrl || '',
    faviconUrl: settings.faviconUrl || '',
    customCss: settings.customCss || '',
    showHourlyToggle: settings.showHourlyToggle ?? true,
    customFooterText: settings.customFooterText || '',
    customTextOverrides: settings.customTextOverrides || {},
  });

  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>('master');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('configurator');
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [stringSearchQuery, setStringSearchQuery] = useState('');

  // Live apply theme to DOM as admin changes any control
  useEffect(() => {
    applyThemeToDom(formData);
  }, [formData]);

  const handleFieldChange = (field: keyof AdminSettingsData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyMasterTheme = (theme: MasterThemePreset) => {
    setFormData((prev) => ({
      ...prev,
      ...theme.settings,
      masterTheme: theme.id,
    }));
  };

  const handleApplyColorPreset = (preset: { primary: string; secondary: string }) => {
    setFormData((prev) => ({
      ...prev,
      brandPrimaryColor: preset.primary,
      brandSecondaryColor: preset.secondary,
    }));
  };

  const handleApplyFontSizePreset = (preset: { id: 'compact' | 'normal' | 'spacious' | 'extra_large'; baseSize: number; headingScale: number }) => {
    setFormData((prev) => ({
      ...prev,
      fontSizeScale: preset.id,
      baseFontSize: preset.baseSize,
      headingScale: preset.headingScale,
    }));
  };

  const handleApplyLayoutPreset = (preset: { id: 'rounded' | 'sharp' | 'curved' | 'compact' | 'fluid'; radius: number; elevation: 'none' | 'subtle' | 'elevated' | 'glow'; spacing: 'compact' | 'normal' | 'spacious'; container: 'boxed' | 'standard' | 'wide' | 'fluid' }) => {
    setFormData((prev) => ({
      ...prev,
      layoutPreset: preset.id,
      borderRadius: preset.radius,
      cardElevation: preset.elevation,
      spacingDensity: preset.spacing,
      containerWidth: preset.container,
    }));
  };

  const handleApplyTextPreset = (preset: { id: 'standard' | 'agency' | 'devops' | 'enterprise'; heroTitle: string; heroDescription: string; deployButtonText: string; dashboardTitle: string; dashboardDescription: string; walletTitle: string }) => {
    setFormData((prev) => ({
      ...prev,
      textPreset: preset.id,
      heroTitle: preset.heroTitle,
      heroDescription: preset.heroDescription,
      deployButtonText: preset.deployButtonText,
      dashboardTitle: preset.dashboardTitle,
      dashboardDescription: preset.dashboardDescription,
      walletTitle: preset.walletTitle,
    }));
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all customizations to default Arvan Sorkhab settings?')) {
      const defaults = getDefaultCustomizationSettings();
      setFormData((prev) => ({ ...prev, ...defaults }));
    }
  };

  const handleStringOverrideChange = (key: string, value: string) => {
    setFormData((prev) => {
      const newOverrides = { ...(prev.customTextOverrides || {}) };
      if (value.trim() === '') {
        delete newOverrides[key];
      } else {
        newOverrides[key] = value;
      }
      return { ...prev, customTextOverrides: newOverrides };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      console.error('Failed to save customizations:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Customizable strings table with active WordPress language and Persian support
  const allStringKeys = useMemo(() => getCustomizableKeys(language), [language]);
  const filteredStrings = useMemo(() => {
    if (!stringSearchQuery) return allStringKeys.slice(0, 50);
    const q = stringSearchQuery.toLowerCase().trim();
    return allStringKeys.filter(
      (item) =>
        item.key.toLowerCase().includes(q) ||
        item.defaultFa.toLowerCase().includes(q) ||
        item.defaultCurrent.toLowerCase().includes(q) ||
        item.defaultEn.toLowerCase().includes(q)
    );
  }, [allStringKeys, stringSearchQuery]);

  const primaryColor = formData.brandPrimaryColor || '#008b8b';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto">
      {/* ── 1. Top Action Header ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full animate-ping" style={{ backgroundColor: primaryColor }} />
            <h2 className="text-xl font-black text-slate-900">
              {t('Visual Customization & Theming Studio')}
            </h2>
            <Badge variant="outline" className="text-[11px] font-mono font-bold bg-slate-50 border-slate-200">
              v1.2 Studio
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('Fully customize brand colors, typography, font sizes, layouts, and texts with 1-click presets and granular manual editing.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="gap-1.5 text-xs text-slate-600 hover:text-slate-900 border-slate-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t('Reset Defaults')}</span>
          </Button>

          <Button
            type="submit"
            size="lg"
            disabled={isSaving}
            className="gap-2 font-bold px-8 shadow-sm text-white transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>{t('applying') || t('Applying...') || (language === 'fa' ? 'در حال اعمال...' : 'Applying...')}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>{t('Save All Customizations') || (language === 'fa' ? 'ذخیره تمام تنظیمات سفارشی‌سازی' : 'Save All Customizations')}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── 2. Studio Category Tabs ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/60 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveStudioTab('master')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeStudioTab === 'master'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          )}
        >
          <Sparkles className="h-4 w-4" style={{ color: activeStudioTab === 'master' ? primaryColor : undefined }} />
          <span>{t('1-Click Master Themes')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('colors')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeStudioTab === 'colors'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          )}
        >
          <Palette className="h-4 w-4" style={{ color: activeStudioTab === 'colors' ? primaryColor : undefined }} />
          <span>{t('Colors & Palettes')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('typography')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeStudioTab === 'typography'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          )}
        >
          <Type className="h-4 w-4" style={{ color: activeStudioTab === 'typography' ? primaryColor : undefined }} />
          <span>{t('Typography & Font Sizes')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('layout')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeStudioTab === 'layout'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          )}
        >
          <Layout className="h-4 w-4" style={{ color: activeStudioTab === 'layout' ? primaryColor : undefined }} />
          <span>{t('Layout, Radius & Shapes')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('texts')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeStudioTab === 'texts'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          )}
        >
          <FileText className="h-4 w-4" style={{ color: activeStudioTab === 'texts' ? primaryColor : undefined }} />
          <span>{t('Texts & Copywriting')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('css')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeStudioTab === 'css'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          )}
        >
          <Sliders className="h-4 w-4" style={{ color: activeStudioTab === 'css' ? primaryColor : undefined }} />
          <span>{t('Custom CSS Overrides')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStudioTab('integration')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
            activeStudioTab === 'integration'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          )}
        >
          <Code2 className="h-4 w-4" style={{ color: activeStudioTab === 'integration' ? primaryColor : undefined }} />
          <span>{t('Gutenberg & Shortcodes')}</span>
        </button>
      </div>

      {/* ── 3. Main Workspace: Controls (Left 7 cols) & Live Simulator (Right 5 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: 1-Click Master Themes */}
          {activeStudioTab === 'master' && (
            <Card elevation={1} className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">
                    <Sparkles className="h-5 w-5" style={{ color: primaryColor }} />
                    <span>{t('1-Click Master Theme Packs')}</span>
                  </CardTitle>
                  <span className="text-[11px] text-slate-400">
                    {MASTER_THEMES.length} {t('Ready Presets')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-500">
                  {t('Master themes instantly configure harmonious brand colors, Persian/Latin fonts, scale sizes, border radius, and copywriting terminology in one click.')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {MASTER_THEMES.map((theme) => {
                    const isSelected = formData.masterTheme === theme.id;
                    const themePrimary = theme.settings.brandPrimaryColor || '#008b8b';
                    const themeSecondary = theme.settings.brandSecondaryColor || '#0b3a42';
                    return (
                      <div
                        key={theme.id}
                        onClick={() => handleApplyMasterTheme(theme)}
                        className={cn(
                          'p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group text-right',
                          isSelected
                            ? 'border-slate-900 bg-slate-50 shadow-md ring-2 ring-slate-900'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded-full border-2 border-white shadow-sm shrink-0"
                              style={{ backgroundColor: themePrimary }}
                            />
                            <div
                              className="h-4 w-4 rounded-full border-2 border-white shadow-sm shrink-0 -mr-2"
                              style={{ backgroundColor: themeSecondary }}
                            />
                            <span className="text-xs font-bold text-slate-900 mr-2">{t(theme.name)}</span>
                          </div>
                          {isSelected && (
                            <Badge className="bg-slate-900 text-white text-[10px] font-bold">
                              {t('Active')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {t(theme.description)}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
                          <span>{theme.settings.fontFamily}</span>
                          <span>{theme.settings.borderRadius}px / {theme.settings.baseFontSize}px</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: Colors & Palettes */}
          {activeStudioTab === 'colors' && (
            <Card elevation={1} className="border-slate-200 space-y-6">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  <Palette className="h-5 w-5" style={{ color: primaryColor }} />
                  <span>{t('Brand Color Palette & Surfaces')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-2">
                    {t('Curated Color Presets')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyColorPreset(preset)}
                        className={cn(
                          'flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all text-right',
                          formData.brandPrimaryColor === preset.primary
                            ? 'border-slate-900 bg-slate-100 shadow-sm ring-1 ring-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        )}
                      >
                        <div
                          className="h-5 w-5 rounded-full border border-white shadow-sm shrink-0"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span className="truncate text-slate-800">{t(preset.name)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Granular Color Editors */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900">{t('Manual Color Customization')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {t('Primary Brand Color')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.brandPrimaryColor || '#008b8b'}
                          onChange={(e) => handleFieldChange('brandPrimaryColor', e.target.value)}
                          className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-white p-1"
                        />
                        <Input
                          value={formData.brandPrimaryColor || '#008b8b'}
                          onChange={(e) => handleFieldChange('brandPrimaryColor', e.target.value)}
                          className="font-mono uppercase text-xs"
                        />
                      </div>
                    </div>

                    {/* Secondary */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {t('Secondary / Dark Accent')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.brandSecondaryColor || '#0b3a42'}
                          onChange={(e) => handleFieldChange('brandSecondaryColor', e.target.value)}
                          className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-white p-1"
                        />
                        <Input
                          value={formData.brandSecondaryColor || '#0b3a42'}
                          onChange={(e) => handleFieldChange('brandSecondaryColor', e.target.value)}
                          className="font-mono uppercase text-xs"
                        />
                      </div>
                    </div>

                    {/* Card Surface */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {t('Card Surface Background')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.colorSurface || '#ffffff'}
                          onChange={(e) => handleFieldChange('colorSurface', e.target.value)}
                          className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-white p-1"
                        />
                        <Input
                          value={formData.colorSurface || '#ffffff'}
                          onChange={(e) => handleFieldChange('colorSurface', e.target.value)}
                          className="font-mono uppercase text-xs"
                        />
                      </div>
                    </div>

                    {/* Canvas Background */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {t('App Canvas Background')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.colorBackground || '#f8fafc'}
                          onChange={(e) => handleFieldChange('colorBackground', e.target.value)}
                          className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-white p-1"
                        />
                        <Input
                          value={formData.colorBackground || '#f8fafc'}
                          onChange={(e) => handleFieldChange('colorBackground', e.target.value)}
                          className="font-mono uppercase text-xs"
                        />
                      </div>
                    </div>

                    {/* Text Primary */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {t('Primary Text Color')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.colorText || '#0f172a'}
                          onChange={(e) => handleFieldChange('colorText', e.target.value)}
                          className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-white p-1"
                        />
                        <Input
                          value={formData.colorText || '#0f172a'}
                          onChange={(e) => handleFieldChange('colorText', e.target.value)}
                          className="font-mono uppercase text-xs"
                        />
                      </div>
                    </div>

                    {/* Border / Divider */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {t('Border & Line Divider Color')}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.colorBorder || '#e2e8f0'}
                          onChange={(e) => handleFieldChange('colorBorder', e.target.value)}
                          className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer bg-white p-1"
                        />
                        <Input
                          value={formData.colorBorder || '#e2e8f0'}
                          onChange={(e) => handleFieldChange('colorBorder', e.target.value)}
                          className="font-mono uppercase text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: Typography & Font Sizes */}
          {activeStudioTab === 'typography' && (
            <Card elevation={1} className="border-slate-200 space-y-6">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  <Type className="h-5 w-5" style={{ color: primaryColor }} />
                  <span>{t('Typography, Web Fonts & Size Hierarchy')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Family Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-2">
                    {t('Select Font Family Stack')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FONT_PRESETS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => handleFieldChange('fontFamily', font.id)}
                        className={cn(
                          'flex flex-col p-3.5 rounded-2xl border text-right transition-all group',
                          formData.fontFamily === font.id
                            ? 'border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50/60'
                        )}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xs font-bold text-slate-900">{t(font.name)}</span>
                          {formData.fontFamily === font.id && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-normal leading-relaxed">{t(font.sub)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Font URL if custom chosen */}
                {formData.fontFamily === 'custom' && (
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-3">
                    <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <span>{t('Custom External Web Font Configuration')}</span>
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {t('Font Family Name')}
                        </label>
                        <Input
                          value={formData.customFontName || ''}
                          onChange={(e) => handleFieldChange('customFontName', e.target.value)}
                          placeholder="e.g. Dana, IRANSansX, Outfit"
                          className="text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {t('Web Font CSS URL (Google Fonts / CDN)')}
                        </label>
                        <Input
                          value={formData.customFontUrl || ''}
                          onChange={(e) => handleFieldChange('customFontUrl', e.target.value)}
                          placeholder="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap"
                          className="text-xs font-mono bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Font Size Presets */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800 block mb-2">
                    {t('Font Size & Density Presets')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {FONT_SIZE_PRESETS.map((sizePreset) => (
                      <button
                        key={sizePreset.id}
                        type="button"
                        onClick={() => handleApplyFontSizePreset(sizePreset)}
                        className={cn(
                          'p-3 rounded-xl border text-center transition-all',
                          formData.fontSizeScale === sizePreset.id
                            ? 'border-slate-900 bg-slate-50 font-bold shadow-sm ring-1 ring-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <div className="text-xs font-bold text-slate-900">{t(sizePreset.name)}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{sizePreset.baseSize}px Base</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Granular Sliders for Size & Scales */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900">{t('Manual Typography Scale Sliders')}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{t('Base Body Font Size')}</span>
                        <span className="font-mono font-bold text-slate-900">{formData.baseFontSize || 14}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="20"
                        step="1"
                        value={formData.baseFontSize || 14}
                        onChange={(e) => handleFieldChange('baseFontSize', parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{t('Heading Scale Multiplier')}</span>
                        <span className="font-mono font-bold text-slate-900">{formData.headingScale || 1.25}x</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="1.5"
                        step="0.05"
                        value={formData.headingScale || 1.25}
                        onChange={(e) => handleFieldChange('headingScale', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: Layout, Radius & Shapes */}
          {activeStudioTab === 'layout' && (
            <Card elevation={1} className="border-slate-200 space-y-6">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  <Layout className="h-5 w-5" style={{ color: primaryColor }} />
                  <span>{t('Layout Architecture, Border Radius & Spacing')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Layout Presets */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-2">
                    {t('Layout & Shape Presets')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {LAYOUT_PRESETS.map((lp) => (
                      <button
                        key={lp.id}
                        type="button"
                        onClick={() => handleApplyLayoutPreset(lp)}
                        className={cn(
                          'p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between',
                          formData.layoutPreset === lp.id
                            ? 'border-slate-900 bg-slate-50 font-bold shadow-sm ring-1 ring-slate-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{t(lp.name)}</div>
                          <div className="text-[11px] text-slate-400 mt-1 font-normal leading-relaxed">{t(lp.description)}</div>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-2 font-mono">{lp.radius}px Radius</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manual Sliders & Settings */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-900">{t('Manual Shape & Elevation Adjustments')}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{t('Corner Border Radius')}</span>
                        <span className="font-mono font-bold text-slate-900">{formData.borderRadius ?? 16}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        step="2"
                        value={formData.borderRadius ?? 16}
                        onChange={(e) => handleFieldChange('borderRadius', parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Card Elevation')}
                        </label>
                        <select
                          value={formData.cardElevation || 'subtle'}
                          onChange={(e) => handleFieldChange('cardElevation', e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5"
                        >
                          <option value="none">{t('Flat / No Shadow')}</option>
                          <option value="subtle">{t('Subtle M3 Elevation')}</option>
                          <option value="elevated">{t('High 3D Elevation')}</option>
                          <option value="glow">{t('Brand Colored Glow')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Spacing Density')}
                        </label>
                        <select
                          value={formData.spacingDensity || 'normal'}
                          onChange={(e) => handleFieldChange('spacingDensity', e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5"
                        >
                          <option value="compact">{t('Compact (Tighter)')}</option>
                          <option value="normal">{t('Standard / Balanced')}</option>
                          <option value="spacious">{t('Spacious / Roomy')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Container Max Width')}
                        </label>
                        <select
                          value={formData.containerWidth || 'standard'}
                          onChange={(e) => handleFieldChange('containerWidth', e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 bg-white p-2.5"
                        >
                          <option value="boxed">{t('Boxed (1120px)')}</option>
                          <option value="standard">{t('Standard (1280px)')}</option>
                          <option value="wide">{t('Wide (1480px)')}</option>
                          <option value="fluid">{t('Full Width (100%)')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 5: Texts, Copywriting & Granular Overrides */}
          {activeStudioTab === 'texts' && (
            <div className="space-y-6">
              <Card elevation={1} className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold">
                    <FileText className="h-5 w-5" style={{ color: primaryColor }} />
                    <span>{t('Copywriting Presets & Core Storefront Texts')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Presets */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-2">
                      {t('Copywriting & Terminology Presets')}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TEXT_PRESETS.map((tp) => (
                        <button
                          key={tp.id}
                          type="button"
                          onClick={() => handleApplyTextPreset(tp)}
                          className={cn(
                            'p-3.5 rounded-2xl border text-right transition-all',
                            formData.textPreset === tp.id
                              ? 'border-slate-900 bg-slate-50 font-bold shadow-sm ring-1 ring-slate-900'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          )}
                        >
                          <div className="text-xs font-bold text-slate-900">{t(tp.name)}</div>
                          <div className="text-[11px] text-slate-400 mt-1 font-normal leading-relaxed">{t(tp.description)}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Core Field Editors */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900">{t('Main Brand & Action Texts')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Store Brand Name')}
                        </label>
                        <Input
                          value={formData.storeName || ''}
                          onChange={(e) => handleFieldChange('storeName', e.target.value)}
                          placeholder="e.g. My Brand Cloud"
                          className="text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Brand Tagline')}
                        </label>
                        <Input
                          value={formData.storeTagline || ''}
                          onChange={(e) => handleFieldChange('storeTagline', e.target.value)}
                          placeholder="e.g. High Performance NVMe Cloud Computing"
                          className="text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Configurator Hero Title')}
                        </label>
                        <Input
                          value={formData.heroTitle || ''}
                          onChange={(e) => handleFieldChange('heroTitle', e.target.value)}
                          className="text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Deploy CTA Button Label')}
                        </label>
                        <Input
                          value={formData.deployButtonText || ''}
                          onChange={(e) => handleFieldChange('deployButtonText', e.target.value)}
                          className="text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Dashboard Title')}
                        </label>
                        <Input
                          value={formData.dashboardTitle || ''}
                          onChange={(e) => handleFieldChange('dashboardTitle', e.target.value)}
                          className="text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Wallet & Credit Label')}
                        </label>
                        <Input
                          value={formData.walletTitle || ''}
                          onChange={(e) => handleFieldChange('walletTitle', e.target.value)}
                          className="text-xs"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          {t('Custom Footer Notice / SLA Guarantee Text')}
                        </label>
                        <Input
                          value={formData.customFooterText || ''}
                          onChange={(e) => handleFieldChange('customFooterText', e.target.value)}
                          placeholder="All servers hosted on Tier-3 datacenters with 99.99% uptime guarantee."
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Granular String Overrides Table */}
              <Card elevation={1} className="border-slate-200">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-sm font-bold">
                      <SlidersHorizontal className="h-4 w-4" style={{ color: primaryColor }} />
                      <span>{t('Granular UI Translation & String Overrides')}</span>
                    </CardTitle>
                    <div className="relative w-full sm:w-80">
                      <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        value={stringSearchQuery}
                        onChange={(e) => setStringSearchQuery(e.target.value)}
                        placeholder={t('Search translation keys or texts...')}
                        className="text-xs pr-8 bg-slate-50"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-[11px] text-slate-500">
                    {t('Customize any specific button, label, or tooltip across the customer canvas and admin portal.')}
                  </p>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-96 overflow-y-auto">
                    {filteredStrings.map((item) => {
                      const currentVal = formData.customTextOverrides?.[item.key] ?? '';
                      const displayDefault = item.defaultCurrent || item.defaultFa || item.key;
                      const hasOverride = currentVal.trim() !== '';

                      return (
                        <div
                          key={item.key}
                          className={cn(
                            'p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors',
                            hasOverride ? 'bg-amber-50/40' : 'bg-white hover:bg-slate-50/80'
                          )}
                        >
                          <div className="space-y-1 max-w-sm">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>{item.defaultFa}</span>
                              {hasOverride && (
                                <span
                                  className="text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold"
                                  style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                                >
                                  {t('Current Value')}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-2">
                              <span>{item.key}</span>
                              {language !== 'fa' && (
                                <span className="text-slate-500 font-sans">
                                  ({language.toUpperCase()}: {displayDefault})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full sm:w-80">
                            <Input
                              value={currentVal}
                              onChange={(e) => handleStringOverrideChange(item.key, e.target.value)}
                              placeholder={displayDefault}
                              className="text-xs bg-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 6: Custom CSS Overrides */}
          {activeStudioTab === 'css' && (
            <Card elevation={1} className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  <Sliders className="h-5 w-5" style={{ color: primaryColor }} />
                  <span>{t('Custom CSS Style Overrides')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={formData.customCss || ''}
                  onChange={(e) => handleFieldChange('customCss', e.target.value)}
                  placeholder={`/* Add custom CSS rules here (live injected) */\n.arvan-server-card {\n  border-radius: 24px;\n  backdrop-filter: blur(8px);\n}`}
                  rows={8}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-900 text-emerald-400 font-mono text-xs p-4 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  spellCheck={false}
                />
                <p className="text-[11px] text-slate-400">
                  {t('Custom CSS will be automatically injected into both the isolated standalone canvas and all embedded Gutenberg blocks/shortcodes.')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* TAB 7: Gutenberg & Shortcodes Hub */}
          {activeStudioTab === 'integration' && (
            <Card elevation={1} className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold">
                  <Code2 className="h-5 w-5" style={{ color: primaryColor }} />
                  <span>{t('Gutenberg Block, Elementor Widget & Shortcodes')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                      {t('Native Gutenberg Blocks')}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {t('Insert "arvan/server-configurator" or "arvan/customer-dashboard" anywhere in the WordPress Block Editor with full sidebar controls for colors, radius, fonts, Persian digits, and layouts.')}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                      {t('Elementor Page Builder Widgets')}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {t('Drag & drop "ArvanCloud Server Configurator" and "ArvanCloud Customer Dashboard" from the Elementor widget panel under "ArvanCloud Services" category with live preview.')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('Configurator Shortcode (Elementor / Classic Editor)')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 select-all">
                      [arvan_server_configurator region="{formData.defaultRegion || 'ir-thr-c2'}" color="{primaryColor}" border_radius="{formData.borderRadius || 16}"]
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(`[arvan_server_configurator region="${formData.defaultRegion || 'ir-thr-c2'}" color="${primaryColor}" border_radius="${formData.borderRadius || 16}"]`)}
                      className="gap-1.5 text-xs font-bold shrink-0"
                    >
                      {copiedCode?.includes('arvan_server_configurator') ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{t('Copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>{t('Copy Shortcode')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('Customer Dashboard Shortcode')}
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-xs text-slate-800 select-all">
                      [arvan_customer_dashboard color="{primaryColor}" border_radius="{formData.borderRadius || 16}"]
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyCode(`[arvan_customer_dashboard color="${primaryColor}" border_radius="${formData.borderRadius || 16}"]`)}
                      className="gap-1.5 text-xs font-bold shrink-0"
                    >
                      {copiedCode?.includes('arvan_customer_dashboard') ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{t('Copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>{t('Copy Shortcode')}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── 4. Live Multi-View & Responsive Simulator (Right 5 Cols) ─────── */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <Card elevation={2} className="border-slate-200 bg-white overflow-hidden shadow-lg">
            {/* Simulator Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewMode('configurator')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                    previewMode === 'configurator' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {t('Configurator')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('dashboard')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                    previewMode === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {t('Dashboard')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('admin')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                    previewMode === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {t('Admin Hub')}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn(
                    'p-1.5 rounded-lg text-slate-500 hover:text-slate-900 transition-all',
                    previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : ''
                  )}
                  title={t('Desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={cn(
                    'p-1.5 rounded-lg text-slate-500 hover:text-slate-900 transition-all',
                    previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : ''
                  )}
                  title={t('Mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Simulated Live Viewport */}
            <div
              className={cn(
                'p-4 transition-all duration-300 mx-auto',
                previewDevice === 'mobile' ? 'max-w-[340px] border-x border-slate-200 my-2 rounded-2xl bg-slate-50' : 'w-full'
              )}
              style={{
                backgroundColor: formData.colorBackground || '#f8fafc',
                borderRadius: `${formData.borderRadius || 16}px`,
              }}
            >
              {/* 1. Preview: Configurator */}
              {previewMode === 'configurator' && (
                <div className="space-y-3.5 text-right">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 w-7 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Server className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{formData.storeName || 'ArvanCloud Reseller'}</div>
                        <div className="text-[9px] text-slate-400 truncate max-w-[150px]">{formData.storeTagline}</div>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                    >
                      IR-THR-C2
                    </span>
                  </div>

                  <div className="text-center space-y-0.5">
                    <div className="text-xs font-black text-slate-900">{formData.heroTitle || 'سفارش سرور ابری'}</div>
                    <div className="text-[10px] text-slate-500 leading-snug">{formData.heroDescription}</div>
                  </div>

                  {/* Plan Card */}
                  <div
                    className="p-3.5 rounded-2xl border transition-all space-y-2.5"
                    style={{
                      backgroundColor: formData.colorSurface || '#ffffff',
                      borderColor: primaryColor,
                      borderRadius: `${formData.borderRadius || 16}px`,
                      boxShadow: `0 4px 12px ${primaryColor}20`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{t('Standard General (g1-2-4)')}</span>
                      <Badge style={{ backgroundColor: primaryColor, color: '#ffffff' }} className="text-[9px]">
                        {t('mostPopular')}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-slate-500">{t('2 vCPU • 4 GB RAM • 40 GB NVMe')}</div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">{t('hourlyRate')}:</span>
                      <span className="text-xs font-black" style={{ color: primaryColor }}>{t('540 Toman/hr')}</span>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-black shadow-md transition-transform active:scale-95"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius: `${formData.borderRadius || 16}px`,
                    }}
                  >
                    {formData.deployButtonText || 'ایجاد و تحویل آنی سرور'}
                  </button>
                </div>
              )}

              {/* 2. Preview: Dashboard */}
              {previewMode === 'dashboard' && (
                <div className="space-y-3 text-right">
                  <div
                    className="p-3 rounded-2xl border space-y-2 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${formData.brandSecondaryColor || '#0b3a42'})`,
                      borderRadius: `${formData.borderRadius || 16}px`,
                    }}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-90">
                      <span>{formData.walletTitle || 'کیف پول و شارژ حساب'}</span>
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-base font-black">{t('250,000 Toman')}</div>
                    <div className="text-[9px] opacity-80">{t('92.5 hours runtime remaining')}</div>
                  </div>

                  <div
                    className="p-3 rounded-2xl border bg-white space-y-1.5"
                    style={{
                      borderRadius: `${formData.borderRadius || 16}px`,
                      borderColor: formData.colorBorder || '#e2e8f0',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-slate-800">srv-production-web</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500">185.143.232.44</span>
                    </div>
                    <div className="text-[10px] text-slate-400">g1-2-4 • {t('Tehran')} ({t('Forough')})</div>
                  </div>
                </div>
              )}

              {/* 3. Preview: Admin Hub */}
              {previewMode === 'admin' && (
                <div className="space-y-3 text-right">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-slate-900">{formData.storeName || 'ArvanCloud'} - {t('Admin Hub')}</div>
                    <Badge variant="outline" className="text-[9px] font-mono">{t('backOffice')}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl border bg-white space-y-0.5">
                      <div className="text-[9px] text-slate-400">{t('Total Active VMs')}</div>
                      <div className="text-sm font-black text-slate-900">{t('12 Instances')}</div>
                    </div>
                    <div className="p-2.5 rounded-xl border bg-white space-y-0.5">
                      <div className="text-[9px] text-slate-400">{t('MRR Revenue')}</div>
                      <div className="text-sm font-black" style={{ color: primaryColor }}>{t('3,450,000 T')}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[10px] text-slate-400">
                {t('Live real-time preview updating instantly across all sliders & controls.')}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* ── 5. Bottom Sticky Save Bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-xs text-slate-500">
          {t('All customizations apply universally across Admin and Customer Storefront views.')}
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isSaving}
          className="gap-2 font-black px-10 text-white shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>{t('applying') || t('Applying...') || (language === 'fa' ? 'در حال اعمال...' : 'Applying...')}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{t('Save All Customizations') || (language === 'fa' ? 'ذخیره تمام تنظیمات سفارشی‌سازی' : 'Save All Customizations')}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
