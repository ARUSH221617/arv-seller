import React, { useState } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Globe2,
  Key,
  Lock,
  Zap,
  Sparkles,
  Check,
  Copy,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  DatacenterRegion,
  HardwareFlavor,
  OsImage,
  SupportedLanguage,
} from '../types';
import { formatCurrency, formatNumber, toPersianDigits, cn } from '../lib/utils';
import { OsLogo } from '../components/ui/OsLogo';

interface ServerConfiguratorViewProps {
  regions: DatacenterRegion[];
  flavors: HardwareFlavor[];
  images: OsImage[];
  balance: number;
  currency: string;
  language: SupportedLanguage;
  t: (key: string) => string;
  initialRegionId?: string;
  initialFlavorId?: string;
  initialImageId?: string;
  initialDiskSize?: number;
  ctaButtonText?: string;
  customTitle?: string;
  customTagline?: string;
  showHeader?: boolean;
  showRegionSelector?: boolean;
  showStorageSlider?: boolean;
  showOsSelector?: boolean;
  showHourlyPrice?: boolean;
  onDeploy: (payload: {
    name: string;
    region_id: string;
    flavor_id: string;
    image_id: string;
    disk_size: number;
    ssh_key?: string;
    password?: string;
  }) => Promise<unknown>;
  onOpenDeposit: () => void;
}

export const ServerConfiguratorView: React.FC<ServerConfiguratorViewProps> = ({
  regions,
  flavors,
  images,
  balance,
  currency,
  language,
  t,
  initialRegionId,
  initialFlavorId,
  initialImageId,
  initialDiskSize,
  ctaButtonText,
  customTitle,
  customTagline,
  showHeader = true,
  showRegionSelector = true,
  showStorageSlider = true,
  showOsSelector = true,
  showHourlyPrice = true,
  onDeploy,
  onOpenDeposit,
}) => {
  // Configurator selections with initial customization props
  const [selectedRegionId, setSelectedRegionId] = useState<string>(
    initialRegionId || regions[0]?.id || 'ir-thr-c2'
  );
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>(
    initialFlavorId || flavors[1]?.id || 'g1-2-4'
  );
  const [selectedImageId, setSelectedImageId] = useState<string>(
    initialImageId || images[0]?.id || 'ubuntu-22.04'
  );
  const [flavorCategory, setFlavorCategory] = useState<string>('all');
  const [diskSize, setDiskSize] = useState<number>(initialDiskSize || 40);
  const [hostname, setHostname] = useState<string>('srv-cloud-instance');
  const [authMethod, setAuthMethod] = useState<'ssh' | 'password'>('password');
  const [sshKey, setSshKey] = useState<string>('');
  const [password, setPassword] = useState<string>('Arv@nCl0ud#2026!');
  const [copiedPwd, setCopiedPwd] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  // Active objects
  const selectedRegion = regions.find((r) => r.id === selectedRegionId) || regions[0];
  const selectedFlavor = flavors.find((f) => f.id === selectedFlavorId) || flavors[0];
  const selectedImage = images.find((i) => i.id === selectedImageId) || images[0];

  // Helper functions for safe flavor property extraction
  const getFlavorVcpus = (fl?: any) => fl?.vcpus ?? fl?.cpu ?? 1;
  const getFlavorRamGb = (fl?: any) => fl?.ram_mb ? Math.round(fl.ram_mb / 1024) : (fl?.ram ?? 2);
  const getFlavorDiskGb = (fl?: any) => fl?.disk_gb ?? fl?.disk ?? 25;
  const getFlavorHourlyCost = (fl?: any) => fl?.hourly_cost ?? fl?.price ?? 540;
  const getFlavorIsPopular = (fl?: any) => Boolean(fl?.is_popular ?? fl?.isPopular);

  // Dynamic price calculation (+4 Toman per extra GB above base 25GB)
  const baseDisk = getFlavorDiskGb(selectedFlavor);
  const extraDisk = Math.max(0, diskSize - baseDisk);
  const extraDiskHourlyCost = extraDisk * 4;
  const totalHourlyPrice = getFlavorHourlyCost(selectedFlavor) + extraDiskHourlyCost;
  const totalMonthlyPrice = totalHourlyPrice * 720;

  // 24-hour minimum threshold
  const minRequiredBalance = totalHourlyPrice * 24;
  const hasSufficientBalance = balance >= minRequiredBalance;

  // Flavor category filtering
  const filteredFlavors = flavors.filter((fl) => {
    if (flavorCategory === 'all') return true;
    return fl.category === flavorCategory;
  });

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopiedPwd(true);
    setTimeout(() => setCopiedPwd(false), 2000);
  };

  const handleDeployClick = async () => {
    if (!hasSufficientBalance) {
      onOpenDeposit();
      return;
    }
    setIsDeploying(true);
    try {
      await onDeploy({
        name: hostname,
        region_id: selectedRegionId,
        flavor_id: selectedFlavorId,
        image_id: selectedImageId,
        disk_size: diskSize,
        ssh_key: authMethod === 'ssh' ? sshKey : undefined,
        password: authMethod === 'password' ? password : undefined,
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="container py-8">
      {/* Hero Header (Conditional) */}
      {showHeader && (
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[var(--arvan-primary,#008b8b)] text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="h-4 w-4" />
            <span>{t('nextGenCloudIaaS')}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {customTitle || t('deployServer')}
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            {customTagline || t('configuratorHeroDesc')}
          </p>
        </div>
      )}

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Configurator Steps (8 Cols) */}
        <div className="space-y-8 lg:col-span-8">
          {/* Step 1: Datacenter Region (Conditional) */}
          {showRegionSelector && (
            <Card elevation={1}>
              <CardHeader>
                <CardTitle>
                  <Globe2 className="h-5 w-5 text-[var(--arvan-primary,#008b8b)]" />
                  <span>{t('step1Region')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {regions.map((region) => {
                    const isSelected = selectedRegionId === region.id;
                    return (
                      <div
                        key={region.id}
                        onClick={() => setSelectedRegionId(region.id)}
                        className={cn(
                          'relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:border-[var(--arvan-primary,#008b8b)]/50 hover:bg-slate-50',
                          isSelected
                            ? 'border-[var(--arvan-primary,#008b8b)] bg-[var(--arvan-primary,#008b8b)]/5 shadow-sm ring-1 ring-[var(--arvan-primary,#008b8b)]'
                            : 'border-slate-200 bg-white'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{region.flag}</span>
                          {/* Latency indicator OR selected checkmark — never overlaps */}
                          {isSelected ? (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--arvan-primary,#008b8b)] text-white shadow-sm">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="arvan-dot arvan-dot-green" />
                              <span className="text-[11px] font-medium text-slate-500">{toPersianDigits(region.latency || '15ms', language)}</span>
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-sm text-slate-900 mb-0.5">{t(region.name) || region.name}</div>
                        <div className="text-xs text-slate-500">{t(region.city) || region.city}، {t(region.country) || region.country}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Hardware Flavor */}
          <Card elevation={1}>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>
                <Cpu className="h-5 w-5 text-[var(--arvan-primary,#008b8b)]" />
                <span>{t('step2Flavor')}</span>
              </CardTitle>
              {/* Category Segment Filter */}
              <Tabs value={flavorCategory} onValueChange={setFlavorCategory}>
                <TabsList className="h-9">
                  <TabsTrigger value="all" className="text-xs">{t('allPlans')}</TabsTrigger>
                  <TabsTrigger value="general" className="text-xs">{t('general')}</TabsTrigger>
                  <TabsTrigger value="compute" className="text-xs">{t('compute')}</TabsTrigger>
                  <TabsTrigger value="memory" className="text-xs">{t('memory')}</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredFlavors.map((flavor) => {
                  const isSelected = selectedFlavorId === flavor.id;
                  const vcpus = getFlavorVcpus(flavor);
                  const ramGb = getFlavorRamGb(flavor);
                  const diskGb = getFlavorDiskGb(flavor);
                  const cost = getFlavorHourlyCost(flavor);
                  const isPopular = getFlavorIsPopular(flavor);
                  return (
                    <div
                      key={flavor.id}
                      onClick={() => setSelectedFlavorId(flavor.id)}
                      className={cn(
                        'relative cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:border-[var(--arvan-primary,#008b8b)]/50 hover:bg-slate-50',
                        isSelected
                          ? 'border-[var(--arvan-primary,#008b8b)] bg-[var(--arvan-primary,#008b8b)]/5 shadow-sm ring-1 ring-[var(--arvan-primary,#008b8b)]'
                          : 'border-slate-200 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">{t(flavor.name) || flavor.name}</span>
                          {isPopular && (
                            <Badge variant="destructive" className="text-[10px] py-0 px-2 bg-arvan-pink text-white">
                              {t('mostPopular')}
                            </Badge>
                          )}
                        </div>
                        <div className="text-end">
                          <span className="text-sm font-extrabold text-[var(--arvan-primary,#008b8b)]">
                            {formatCurrency(cost, currency, language)}
                          </span>
                          <span className="text-[10px] text-slate-500 block">/ {t('hr')}</span>
                        </div>
                      </div>

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                        <div className="rounded-xl bg-slate-50 p-2">
                          <span className="text-[10px] text-slate-500 block mb-0.5">{t('vcpu')}</span>
                          <span className="text-xs font-extrabold text-slate-800">{formatNumber(vcpus, language)} {t('cores')}</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2">
                          <span className="text-[10px] text-slate-500 block mb-0.5">{t('ram')}</span>
                          <span className="text-xs font-extrabold text-slate-800">{formatNumber(ramGb, language)} GB</span>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-2">
                          <span className="text-[10px] text-slate-500 block mb-0.5">{t('storage')}</span>
                          <span className="text-xs font-extrabold text-slate-800">{formatNumber(diskGb, language)} GB NVMe</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: NVMe Disk Slider (Conditional) */}
          {showStorageSlider && (
            <Card elevation={1}>
              <CardHeader>
                <CardTitle>
                  <HardDrive className="h-5 w-5 text-[var(--arvan-primary,#008b8b)]" />
                  <span>{t('step3Disk')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">{formatNumber(diskSize, language)}</span>
                    <span className="text-sm font-bold text-arvan-teal ms-1.5">GB NVMe SSD</span>
                  </div>
                  <div className="text-end">
                    <span className="text-xs text-slate-500 block">{t('additionalStorage')}:</span>
                    <span className="text-xs font-bold text-slate-800">
                      +{formatCurrency(extraDiskHourlyCost, currency, language)} / {t('hr')}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <Slider
                  value={[diskSize]}
                  min={baseDisk}
                  max={500}
                  step={5}
                  onValueChange={(val) => setDiskSize(val[0])}
                />

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{t('baseDiskLabel')} {formatNumber(baseDisk, language)} GB</span>
                  <span>{formatNumber(100, language)} GB</span>
                  <span>{formatNumber(250, language)} GB</span>
                  <span>{t('maxDiskLabel')} {formatNumber(500, language)} GB</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Operating System (Conditional) */}
          {showOsSelector && (
            <Card elevation={1}>
              <CardHeader>
                <CardTitle>
                  <Layers className="h-5 w-5 text-[var(--arvan-primary,#008b8b)]" />
                  <span>{t('step4Image')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img) => {
                    const isSelected = selectedImageId === img.id;
                    return (
                      <div
                        key={img.id}
                        onClick={() => setSelectedImageId(img.id)}
                        className={cn(
                          'group cursor-pointer rounded-2xl border p-3.5 text-center transition-all duration-200 hover:border-[var(--arvan-primary,#008b8b)]/50 hover:bg-slate-50',
                          isSelected
                            ? 'border-[var(--arvan-primary,#008b8b)] bg-[var(--arvan-primary,#008b8b)]/5 shadow-sm ring-1 ring-[var(--arvan-primary,#008b8b)]'
                            : 'border-slate-200 bg-white'
                        )}
                      >
                        <div
                          className={cn(
                            'mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 shadow-sm',
                            isSelected
                              ? 'bg-white ring-1 ring-[var(--arvan-primary,#008b8b)]/40 shadow-sm scale-105'
                              : 'bg-slate-100/80 group-hover:bg-white group-hover:scale-105'
                          )}
                        >
                          <OsLogo distro={img.distro} name={img.name} className="h-6 w-6" />
                        </div>
                        <div className="font-bold text-xs text-slate-900 mb-0.5">{img.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{img.version}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Authentication & Hostname */}
          <Card elevation={1}>
            <CardHeader>
              <CardTitle>
                <Key className="h-5 w-5 text-[var(--arvan-primary,#008b8b)]" />
                <span>{t('step5Auth')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hostname Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  {t('instanceHostname')}:
                </label>
                <Input
                  type="text"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  placeholder="srv-production-01"
                  className="font-mono"
                />
              </div>

              {/* Auth Method Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  {t('authCredentials')}
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('password')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all',
                      authMethod === 'password'
                        ? 'border-[var(--arvan-primary,#008b8b)] bg-[var(--arvan-primary,#008b8b)]/10 text-[var(--arvan-primary,#008b8b)] shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Lock className="h-4 w-4" />
                    <span>{t('password')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('ssh')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all',
                      authMethod === 'ssh'
                        ? 'border-[var(--arvan-primary,#008b8b)] bg-[var(--arvan-primary,#008b8b)]/10 text-[var(--arvan-primary,#008b8b)] shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <Key className="h-4 w-4" />
                    <span>{t('sshKey')}</span>
                  </button>
                </div>

                {authMethod === 'password' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGeneratePassword}
                        className="shrink-0 text-xs gap-1"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-arvan-teal" />
                        <span>{t('generate')}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCopyPassword}
                        className="shrink-0 text-xs px-3"
                      >
                        {copiedPwd ? <Check className="h-4 w-4 text-arvan-emerald" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={sshKey}
                      onChange={(e) => setSshKey(e.target.value)}
                      placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC..."
                      rows={3}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-arvan-teal focus:outline-none focus:ring-2 focus:ring-arvan-teal/20 shadow-sm"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Sticky Live Order Summary Panel (4 Cols) */}
        <div className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
          <Card elevation={2} className="border-slate-200 shadow-md">
            <CardHeader>
              <CardTitle>
                <ShieldCheck className="h-5 w-5 text-[var(--arvan-primary,#008b8b)]" />
                <span>{t('orderSummary')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Selected Configuration Readout */}
              <div className="space-y-2.5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('region')}:</span>
                  <span className="font-bold text-slate-900">{t(selectedRegion.name) || selectedRegion.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('flavor')}:</span>
                  <span className="font-bold text-slate-900">{t(selectedFlavor.name) || selectedFlavor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('specs')}:</span>
                  <span className="font-bold text-slate-900">{formatNumber(getFlavorVcpus(selectedFlavor), language)} vCPU / {formatNumber(getFlavorRamGb(selectedFlavor), language)} GB RAM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t('storage')}:</span>
                  <span className="font-bold text-slate-900">{formatNumber(diskSize, language)} GB NVMe SSD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{t('os')}:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <OsLogo distro={selectedImage.distro} name={selectedImage.name} className="h-3.5 w-3.5 inline-block" />
                    <span>{selectedImage.name}</span>
                  </span>
                </div>
              </div>

              {/* Pricing Breakdown (Conditional Rate Display) */}
              {showHourlyPrice && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-slate-500">{t('hourlyBurn')}:</span>
                    <span className="text-lg font-extrabold text-[var(--arvan-primary,#008b8b)]">
                      {formatCurrency(totalHourlyPrice, currency, language)} / {t('hr')}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[11px] text-slate-500">
                    <span>{t('monthlyEstimate')}:</span>
                    <span className="font-mono font-bold text-slate-700">
                      ~{formatCurrency(totalMonthlyPrice, currency, language)}
                    </span>
                  </div>
                </div>
              )}

              {/* Wallet Status Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">{t('availableBalance')}:</span>
                  <span className={cn('font-bold', balance > 0 ? 'text-slate-900' : 'text-arvan-rose')}>
                    {formatCurrency(balance, currency, language)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>{t('minRequired')}:</span>
                  <span className="font-mono text-slate-700">{formatCurrency(minRequiredBalance, currency, language)}</span>
                </div>
              </div>

              {/* CTA Deploy Button */}
              <Button
                size="lg"
                onClick={handleDeployClick}
                disabled={isDeploying}
                className="w-full gap-2 text-sm font-extrabold shadow-sm"
              >
                {isDeploying ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>{t('provisioningInstance')}</span>
                  </>
                ) : hasSufficientBalance ? (
                  <>
                    <span>{ctaButtonText || t('instantDeploy')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>{t('insufficientBalance')}</span>
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-slate-400">
                {t('provisionTimeNote')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
