import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  Zap,
  DollarSign,
  Globe2,
  Globe,
  Store,
  ExternalLink,
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Server,
  LayoutDashboard,
  Database,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { AdminSettingsData } from '../types';
import { SupportedLanguage } from '../../types';
import { cn } from '../../lib/utils';

interface AdminSettingsViewProps {
  settings: AdminSettingsData;
  language: SupportedLanguage;
  t: (key: string) => string;
  onSave: (newSettings: AdminSettingsData) => Promise<boolean>;
  onTestConnection: (apiKey: string) => Promise<{ success: boolean; message?: string }>;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  settings: initialSettings,
  t,
  onSave,
  onTestConnection,
}) => {
  const [formData, setFormData] = useState<AdminSettingsData>(initialSettings);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await onTestConnection(formData.apiKey);
      setTestResult({
        success: res.success,
        message: res.message || (res.success ? t('connectedSuccessfully') : t('connectionFailed')),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveSubmit} className="space-y-8">
      {/* 1. ArvanCloud API Authentication */}
      <Card elevation={1}>
        <CardHeader>
          <CardTitle>
            <Key className="h-5 w-5 text-arvan-teal" />
            <span>{t('1. ArvanCloud API Authentication')}</span>
          </CardTitle>
          <p className="text-xs text-slate-500">
            {t('Enter your master ArvanCloud Machine User API Key. All downstream customer resources will be provisioned under this account.')}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('ArvanCloud API Key')}:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="Apikey 98a7bc12-d09f-4351-a89c-34d092e118a9"
                className="flex-1 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={isTesting}
                className="gap-2 shrink-0 border-arvan-teal/40 text-arvan-teal hover:bg-arvan-teal/10 font-bold"
              >
                {isTesting ? (
                  <Sparkles className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                <span>{t('Test Connection')}</span>
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {t('Obtain your API Key from ArvanCloud User Panel > User Profile > API Keys / Machine Users.')}
            </p>

            {testResult && (
              <div
                className={cn(
                  'mt-3 rounded-2xl p-3.5 text-xs flex items-center gap-2.5 border',
                  testResult.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-800'
                )}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Sandbox Toggle */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">{t('Sandbox / Demo Mode')}</span>
                <Badge variant={formData.sandboxMode ? 'default' : 'secondary'}>
                  {formData.sandboxMode ? t('activeMockFallback') : t('liveInfrastructureOnly')}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('When enabled, allows instantaneous testing, mock provisioning, and demo top-ups without connecting to live ArvanCloud infrastructure.')}
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.sandboxMode}
              onChange={(e) => setFormData({ ...formData, sandboxMode: e.target.checked })}
              className="h-5 w-5 rounded-lg border-slate-300 text-arvan-teal focus:ring-arvan-teal cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Dynamic Pricing & Markup Engine */}
      <Card elevation={1}>
        <CardHeader>
          <CardTitle>
            <DollarSign className="h-5 w-5 text-arvan-teal" />
            <span>{t('2. Dynamic Pricing & Reseller Markup Engine')}</span>
          </CardTitle>
          <p className="text-xs text-slate-500">
            {t('Configure profit margins automatically calculated on top of wholesale ArvanCloud infrastructure rates.')}
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('Markup Percentage (%)')}:
            </label>
            <div className="relative">
              <Input
                type="number"
                min="0"
                max="500"
                value={formData.markupPct}
                onChange={(e) => setFormData({ ...formData, markupPct: Number(e.target.value) || 0 })}
                className="pe-12 font-mono font-bold text-arvan-teal"
              />
              <span className="absolute end-4 top-3 text-xs font-bold text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {t('e.g. 20% markup turns wholesale 450 IRT/hr into 540 IRT/hr customer retail price.')}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('Fixed Margin Addition (Toman)')}:
            </label>
            <Input
              type="number"
              min="0"
              value={formData.fixedMargin}
              onChange={(e) => setFormData({ ...formData, fixedMargin: Number(e.target.value) || 0 })}
              className="font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              {t('Optional fixed addition added after percentage markup calculation.')}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('Store Currency')}:
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-arvan-teal shadow-sm"
            >
              <option value="IRT">Toman (IRT)</option>
              <option value="IRR">Rial (IRR)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('Default Datacenter Region')}:
            </label>
            <select
              value={formData.defaultRegion}
              onChange={(e) => setFormData({ ...formData, defaultRegion: e.target.value })}
              className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-arvan-teal shadow-sm"
            >
              <option value="ir-thr-c2">Tehran - Forough (ir-thr-c2)</option>
              <option value="ir-thr-sh1">Tehran - Shahryar (ir-thr-sh1)</option>
              <option value="ir-tbz-dc1">Tabriz - Northwest (ir-tbz-dc1)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 3. White-Label Branding */}
      <Card elevation={1}>
        <CardHeader>
          <CardTitle>
            <Store className="h-5 w-5 text-arvan-teal" />
            <span>{t('3. Storefront White-Label Branding')}</span>
          </CardTitle>
          <p className="text-xs text-slate-500">
            {t('Customization parameters injected into the standalone virtual canvas header and footer.')}
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('Reseller Brand / Store Name')}:
            </label>
            <Input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('Support Contact Email')}:
            </label>
            <Input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('Support Phone Number')}:
            </label>
            <Input
              type="text"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Virtual Storefront Quick Links */}
      <Card elevation={1} className="border-slate-200">
        <CardHeader>
          <CardTitle>
            <Globe2 className="h-5 w-5 text-arvan-teal" />
            <span>{t('Virtual Storefront Quick Links (Theme Isolated)')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="/cloud-services/server/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800 hover:bg-white hover:border-arvan-teal/40 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Server className="h-4 w-4 text-arvan-teal shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-bold">{t('Cloud Server Configurator')}</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-arvan-teal transition-colors" />
          </a>

          <a
            href="/cloud-services/dashboard/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800 hover:bg-white hover:border-arvan-teal/40 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="h-4 w-4 text-arvan-teal shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-bold">{t('Customer Portal & Dashboard')}</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-arvan-teal transition-colors" />
          </a>

          <a
            href="/cloud-services/cdn/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800 hover:bg-white hover:border-arvan-teal/40 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-arvan-teal shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-bold">{t('CDN & Edge DNS Manager')}</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-arvan-teal transition-colors" />
          </a>

          <a
            href="/cloud-services/storage/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-800 hover:bg-white hover:border-arvan-teal/40 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-2.5">
              <Database className="h-4 w-4 text-arvan-teal shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-bold">{t('S3 Object Storage')}</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-arvan-teal transition-colors" />
          </a>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isSaving} className="gap-2 font-extrabold px-8">
          {isSaving ? (
            <Sparkles className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>{t('Save All Reseller Settings')}</span>
        </Button>
      </div>
    </form>
  );
};
