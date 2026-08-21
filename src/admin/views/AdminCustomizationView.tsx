import React, { useState } from 'react';
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
  ExternalLink,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { AdminSettingsData } from '../types';
import { SupportedLanguage } from '../../types';
import { cn } from '../../lib/utils';

interface AdminCustomizationViewProps {
  settings: AdminSettingsData;
  language: SupportedLanguage;
  t: (key: string) => string;
  onSave: (updated: Partial<AdminSettingsData>) => Promise<boolean>;
}

const COLOR_PRESETS = [
  { name: 'Arvan Sorkhab Teal', primary: '#008b8b', secondary: '#0b3a42' },
  { name: 'Royal Sapphire', primary: '#1d4ed8', secondary: '#1e3a8a' },
  { name: 'Emerald Forest', primary: '#059669', secondary: '#064e3b' },
  { name: 'Midnight Violet', primary: '#6d28d9', secondary: '#4c1d95' },
  { name: 'Crimson Rose', primary: '#e11d48', secondary: '#881337' },
  { name: 'Sunset Amber', primary: '#d97706', secondary: '#78350f' },
];

const FONT_OPTIONS = [
  { id: 'vazirmatn', name: 'Vazirmatn (وزیرمتن)', sub: 'Modern Persian UI Font (Default & Recommended)' },
  { id: 'shabnam', name: 'Shabnam (شبنم)', sub: 'Clean Legible Persian Typography' },
  { id: 'yekan', name: 'Yekan Bakh (یکان بخ)', sub: 'Geometric Contemporary Persian Style' },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', sub: 'Clean Western Sans-Serif' },
  { id: 'inter', name: 'Inter UI', sub: 'High-density Screen Typography' },
  { id: 'system', name: 'System Default', sub: 'Native OS font stack' },
];

export const AdminCustomizationView: React.FC<AdminCustomizationViewProps> = ({
  settings,
  language,
  t,
  onSave,
}) => {
  const [formData, setFormData] = useState<AdminSettingsData>({
    ...settings,
    brandPrimaryColor: settings.brandPrimaryColor || '#008b8b',
    brandSecondaryColor: settings.brandSecondaryColor || '#0b3a42',
    fontFamily: settings.fontFamily || 'vazirmatn',
    storeTagline: settings.storeTagline || 'High Performance Cloud Computing & NVMe Storage',
    logoUrl: settings.logoUrl || '',
    faviconUrl: settings.faviconUrl || '',
    customCss: settings.customCss || '',
    showHourlyToggle: settings.showHourlyToggle ?? true,
    customFooterText: settings.customFooterText || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleFieldChange = (field: keyof AdminSettingsData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyPreset = (primary: string, secondary: string) => {
    setFormData((prev) => ({
      ...prev,
      brandPrimaryColor: primary,
      brandSecondaryColor: secondary,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const primaryColor = formData.brandPrimaryColor || '#008b8b';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl">
      {/* 1. Header & Live Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">{t('Storefront Branding & Visual Customization')}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('Personalize brand colors, typography, logos, and integrate native WordPress Gutenberg blocks or shortcodes anywhere on your site.')}
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isSaving}
          className="gap-2 font-bold px-8 shadow-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>{t('applying')}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{t('Save Customization')}</span>
            </>
          )}
        </Button>
      </div>

      {/* 2. Color System & Live Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Color Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card elevation={1} className="border-slate-200">
            <CardHeader>
              <CardTitle>
                <Palette className="h-5 w-5" style={{ color: primaryColor }} />
                <span>{t('Brand Color Palette')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  {t('Color Presets')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset.primary, preset.secondary)}
                      className={cn(
                        'flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all text-right',
                        formData.brandPrimaryColor === preset.primary
                          ? 'border-slate-900 bg-slate-100 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      )}
                    >
                      <div
                        className="h-5 w-5 rounded-full border border-white shadow-sm shrink-0"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="truncate text-slate-800">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
                      placeholder="#008b8b"
                      className="font-mono uppercase text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t('Used on action buttons, selected cards, and active navigation badges.')}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
                      placeholder="#0b3a42"
                      className="font-mono uppercase text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t('Used on card accents and high-contrast section highlights.')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live UI Mockup Preview (5 cols) */}
        <div className="lg:col-span-5">
          <Card elevation={1} className="border-slate-200 bg-slate-50/70 sticky top-24">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
                  <span>{t('Live Theme Preview')}</span>
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-white font-mono">
                  {primaryColor}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mini Mockup Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Server className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{formData.storeName || 'Cloud Reseller'}</div>
                      <div className="text-[10px] text-slate-400">{formData.storeTagline || 'High Performance VMs'}</div>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
                  >
                    Active Tier
                  </span>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Standard General (g1-2-4)</div>
                    <div className="text-[10px] text-slate-500">2 vCPU • 4 GB RAM • 40 GB NVMe</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">540 Toman/hr</div>
                    <div className="text-[9px] text-slate-400">388,800 Toman/mo</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex-1 py-2 px-3 rounded-xl text-white text-xs font-bold shadow-sm transition-transform active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t('Deploy Server')}
                  </button>
                  <button
                    type="button"
                    className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                  >
                    {t('dashboard')}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                {t('This preview reflects how customer storefront cards, CTA buttons, and badges render in real time.')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Brand Identity & Logo Settings */}
      <Card elevation={1} className="border-slate-200">
        <CardHeader>
          <CardTitle>
            <ImageIcon className="h-5 w-5" style={{ color: primaryColor }} />
            <span>{t('Brand Identity & Logo Assets')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t('Store Brand Name')}
            </label>
            <Input
              value={formData.storeName || ''}
              onChange={(e) => handleFieldChange('storeName', e.target.value)}
              placeholder="e.g. My Hosting Cloud"
              className="text-xs font-semibold"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {t('Displayed in storefront navigation headers and canvas browser titles.')}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t('Brand Tagline / Subtitle')}
            </label>
            <Input
              value={formData.storeTagline || ''}
              onChange={(e) => handleFieldChange('storeTagline', e.target.value)}
              placeholder="e.g. Scalable NVMe Cloud Servers in Tehran & Tabriz"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t('Custom Store Logo URL')}
            </label>
            <Input
              value={formData.logoUrl || ''}
              onChange={(e) => handleFieldChange('logoUrl', e.target.value)}
              placeholder="https://example.com/wp-content/uploads/logo.png"
              className="text-xs font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {t('Leave empty to use standard ArvanCloud teal badge logo.')}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t('Custom Favicon URL')}
            </label>
            <Input
              value={formData.faviconUrl || ''}
              onChange={(e) => handleFieldChange('faviconUrl', e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="text-xs font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t('Custom Footer Notice / Copyright Text')}
            </label>
            <Input
              value={formData.customFooterText || ''}
              onChange={(e) => handleFieldChange('customFooterText', e.target.value)}
              placeholder="e.g. All Cloud Servers hosted on certified Tier-3 Datacenters with 99.99% uptime guarantee."
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Typography & Font Family */}
      <Card elevation={1} className="border-slate-200">
        <CardHeader>
          <CardTitle>
            <Type className="h-5 w-5" style={{ color: primaryColor }} />
            <span>{t('Typography & Font Family Stack')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FONT_OPTIONS.map((font) => (
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
                  <span className="text-xs font-bold text-slate-900">{font.name}</span>
                  {formData.fontFamily === font.id && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-normal leading-relaxed">{font.sub}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 5. Native Gutenberg Block & Shortcodes Embed Hub */}
      <Card elevation={1} className="border-slate-200 bg-gradient-to-br from-white to-slate-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <Code2 className="h-5 w-5" style={{ color: primaryColor }} />
              <span>{t('WordPress Gutenberg Block & Shortcodes Integration')}</span>
            </CardTitle>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
              {t('Gutenberg Ready')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-arvan-teal/15 text-arvan-teal font-bold text-xs">
                  1
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {t('Native Gutenberg Block: "ArvanCloud Server Configurator"')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 max-w-xl">
                {t('Open any WordPress Page or Post in the Block Editor, click (+) Add Block, search for "ArvanCloud", and insert the Server Configurator with visual sidebar inspector settings.')}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs font-mono font-bold">
              arvan/server-configurator
            </Badge>
          </div>

          {/* Shortcode 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                  2
                </span>
                <span>{t('Cloud Server Configurator Shortcode (Elementor / Divi / Classic)')}</span>
              </label>
              <span className="text-[10px] text-slate-400">{t('Click to copy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl border border-slate-200 bg-slate-100/90 px-3.5 py-2.5 font-mono text-xs text-slate-800 select-all">
                [arvan_server_configurator region="{formData.defaultRegion || 'ir-thr-c2'}" color="{primaryColor}"]
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  handleCopyCode(
                    `[arvan_server_configurator region="${formData.defaultRegion || 'ir-thr-c2'}" color="${primaryColor}"]`
                  )
                }
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

          {/* Shortcode 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                  3
                </span>
                <span>{t('Customer Dashboard Shortcode')}</span>
              </label>
              <span className="text-[10px] text-slate-400">{t('Click to copy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl border border-slate-200 bg-slate-100/90 px-3.5 py-2.5 font-mono text-xs text-slate-800 select-all">
                [arvan_customer_dashboard]
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleCopyCode('[arvan_customer_dashboard]')}
                className="gap-1.5 text-xs font-bold shrink-0"
              >
                {copiedCode === '[arvan_customer_dashboard]' ? (
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

      {/* 6. Custom CSS Overrides */}
      <Card elevation={1} className="border-slate-200">
        <CardHeader>
          <CardTitle>
            <Sliders className="h-5 w-5" style={{ color: primaryColor }} />
            <span>{t('Custom CSS Style Overrides')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <textarea
            value={formData.customCss || ''}
            onChange={(e) => handleFieldChange('customCss', e.target.value)}
            placeholder={`/* Add custom CSS rules here */\n.arvan-server-card {\n  border-radius: 20px;\n}`}
            rows={5}
            className="w-full rounded-2xl border border-slate-200 bg-slate-900 text-emerald-400 font-mono text-xs p-4 focus:ring-2 focus:ring-slate-900 focus:outline-none"
            spellCheck={false}
          />
          <p className="text-[11px] text-slate-400">
            {t('Custom CSS will be injected into both the isolated standalone canvas and all embedded Gutenberg blocks/shortcodes.')}
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSaving}
          className="gap-2 font-extrabold px-8 text-white shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>{t('applying')}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{t('Save Customization')}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
