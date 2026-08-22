import React, { useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Flame,
  Clock,
  Server,
  Power,
  RotateCw,
  Trash2,
  Copy,
  AlertTriangle,
  AlertOctagon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  HardDrive,
  Network,
  Shield,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  CloudServerInstance,
  WalletTransaction,
  SupportedLanguage,
} from '../types';
import { formatCurrency, formatDate, formatNumber, cn } from '../lib/utils';

interface CustomerDashboardViewProps {
  balance: number;
  burnRate: number;
  remainingHours: number;
  servers: CloudServerInstance[];
  transactions: WalletTransaction[];
  currency: string;
  language: SupportedLanguage;
  t: (key: string) => string;
  customTitle?: string;
  customDescription?: string;
  walletTitle?: string;
  iaasResources?: {
    volumes: Array<{ id: string; name: string; sizeGigaBytes: number; status: string }>;
    networks: Array<{ id: string; name: string; cidr: string }>;
    firewalls: Array<{ id: string; name: string; rulesCount?: number }>;
  };
  onFetchIaas?: () => void;
  onCreateVolume?: (name: string, size: number) => Promise<boolean>;
  onDeleteVolume?: (volumeId: string) => Promise<boolean>;
  onCreateNetwork?: (name: string, cidr: string) => Promise<boolean>;
  onCreateFirewall?: (name: string) => Promise<boolean>;
  onOpenDeposit: () => void;
  onServerPower: (serverId: number, action: 'power_on' | 'power_off' | 'reboot' | 'delete') => Promise<void>;
  onNavigateDeploy: () => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  balance,
  burnRate,
  remainingHours,
  servers,
  transactions,
  currency,
  language,
  t,
  customTitle,
  customDescription,
  walletTitle,
  iaasResources,
  onFetchIaas,
  onCreateVolume,
  onDeleteVolume,
  onCreateNetwork,
  onCreateFirewall,
  onOpenDeposit,
  onServerPower,
  onNavigateDeploy,
}) => {
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);
  const [volName, setVolName] = useState('');
  const [volSize, setVolSize] = useState(50);
  const [netName, setNetName] = useState('');
  const [netCidr, setNetCidr] = useState('192.168.10.0/24');
  const [fwName, setFwName] = useState('');

  React.useEffect(() => {
    if (onFetchIaas) {
      onFetchIaas();
    }
  }, [onFetchIaas]);

  const isLowBalance = remainingHours > 0 && remainingHours < 12;
  const isSuspended = balance <= 0 && servers.length > 0;

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handlePowerAction = async (serverId: number, action: 'power_on' | 'power_off' | 'reboot' | 'delete') => {
    setLoadingActionId(serverId);
    try {
      await onServerPower(serverId, action);
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {customTitle || t('dashboard')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {customDescription || t('dashboardDesc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onOpenDeposit} className="gap-2 font-bold shadow-sm">
            <Plus className="h-4 w-4" />
            <span>{t('topUp')}</span>
          </Button>
          <Button variant="outline" onClick={onNavigateDeploy} className="gap-2 font-bold">
            <Server className="h-4 w-4 text-[var(--arvan-primary,#008b8b)]" />
            <span>{t('deployServer')}</span>
          </Button>
        </div>
      </div>

      {/* 2. Low Balance / Suspension Warning Banners */}
      {isSuspended && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm flex items-start gap-3.5">
          <AlertOctagon className="h-6 w-6 shrink-0 text-arvan-rose" />
          <div className="flex-1">
            <h4 className="font-extrabold text-sm mb-1">{t('suspensionNotice')}</h4>
            <p className="text-xs text-rose-800 leading-relaxed mb-3">
              {t('suspensionDesc')}
            </p>
            <Button size="sm" variant="destructive" onClick={onOpenDeposit} className="gap-1.5 text-xs font-bold">
              <Plus className="h-3.5 w-3.5" />
              <span>{t('rechargeWalletNow')}</span>
            </Button>
          </div>
        </div>
      )}

      {isLowBalance && !isSuspended && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm flex items-start gap-3.5">
          <AlertTriangle className="h-6 w-6 shrink-0 text-arvan-amber" />
          <div className="flex-1">
            <h4 className="font-extrabold text-sm mb-1">{t('lowBalanceAlert')}</h4>
            <p className="text-xs text-amber-800 leading-relaxed mb-2">
              {t('lowBalanceDesc')}
            </p>
            <Button size="sm" variant="outline" onClick={onOpenDeposit} className="gap-1.5 text-xs border-amber-300 bg-white text-amber-900 hover:bg-amber-100 font-bold">
              <Plus className="h-3.5 w-3.5 text-arvan-amber" />
              <span>{t('quickTopUp')}</span>
            </Button>
          </div>
        </div>
      )}

      {/* 3. Financial KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <Card elevation={2}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {walletTitle || t('availableBalance')}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--arvan-primary-light,#e6f7f7)] text-[var(--arvan-primary,#008b8b)]">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(balance, currency, language)}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Burn Rate */}
        <Card elevation={2}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('hourlyBurn')}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-arvan-pink/10 text-arvan-pink">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(burnRate, currency, language)}
              <span className="text-xs text-slate-500 font-normal ms-1">/ {t('hr')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Runtime */}
        <Card elevation={2}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('estimatedRuntime')}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-arvan-amber/10 text-arvan-amber">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {burnRate > 0
                ? `${formatNumber(Math.round(Number(remainingHours) || 0), language)} ${t('hours')}`
                : `∞ ${t('unlimited')}`}
            </div>
          </CardContent>
        </Card>

        {/* Active Instances */}
        <Card elevation={2}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('activeInstances')}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-arvan-emerald/10 text-arvan-emerald">
                <Server className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900">
              {formatNumber(servers.filter((s) => s.status === 'active').length, language)}
              <span className="text-xs text-slate-500 font-normal ms-1.5">
                / {formatNumber(servers.length, language)} {t('total')}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Active Cloud Servers Table */}
      <Card elevation={1}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>
            <Server className="h-5 w-5 text-[var(--arvan-primary,#008b8b)]" />
            <span>{t('activeCloudVms')}</span>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={onNavigateDeploy} className="gap-1.5 text-xs font-bold">
            <Plus className="h-3.5 w-3.5 text-[var(--arvan-primary,#008b8b)]" />
            <span>{t('deployServer')}</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {servers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Server className="h-12 w-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">{t('noServers')}</p>
              <Button size="sm" onClick={onNavigateDeploy} className="gap-2 font-bold shadow-sm">
                <Plus className="h-4 w-4" />
                <span>{t('deployServer')}</span>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-3.5 px-5 text-start">{t('serverName')}</th>
                    <th className="py-3.5 px-5 text-start">{t('ipAddress')}</th>
                    <th className="py-3.5 px-5 text-start">{t('planSpecs')}</th>
                    <th className="py-3.5 px-5 text-start">{t('hourlyRate')}</th>
                    <th className="py-3.5 px-5 text-start">{t('status')}</th>
                    <th className="py-3.5 px-5 text-end">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {servers.map((srv) => (
                    <tr key={srv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{srv.name}</div>
                        <div className="font-mono text-[11px] text-slate-500">{srv.arvan_uuid}</div>
                      </td>
                      <td className="py-4 px-5">
                        {srv.public_ip ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-900">{srv.public_ip}</span>
                            <button
                              onClick={() => handleCopyIp(srv.public_ip!)}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title={t('copyIp')}
                            >
                              {copiedIp === srv.public_ip ? (
                                <Check className="h-3.5 w-3.5 text-arvan-emerald" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">{t('allocatingIp')}</span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-600">
                        {srv.flavor_id} &bull; {formatNumber(srv.disk_size, language)} GB NVMe
                      </td>
                      <td className="py-4 px-5 font-bold text-[var(--arvan-primary,#008b8b)]">
                        {formatCurrency(srv.hourly_rate, currency, language)} / {t('hr')}
                      </td>
                      <td className="py-4 px-5">
                        {srv.status === 'active' && (
                          <Badge variant="success">
                            <span className="arvan-dot arvan-dot-green" />
                            <span>{t('running')}</span>
                          </Badge>
                        )}
                        {srv.status === 'suspended' && (
                          <Badge variant="warning">
                            <span className="arvan-dot arvan-dot-amber" />
                            <span>{t('suspended')}</span>
                          </Badge>
                        )}
                        {srv.status === 'stopped' && (
                          <Badge variant="destructive">
                            <span className="arvan-dot arvan-dot-red" />
                            <span>{t('stopped')}</span>
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-5 text-end">
                        <div className="flex items-center justify-end gap-1">
                          {srv.status === 'stopped' || srv.status === 'suspended' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={loadingActionId === srv.id}
                              onClick={() => handlePowerAction(srv.id, 'power_on')}
                              className="h-8 px-2.5 text-xs gap-1 border-[var(--arvan-primary,#008b8b)]/50 text-[var(--arvan-primary,#008b8b)] hover:bg-[var(--arvan-primary-light,#e6f7f7)]"
                            >
                              <Power className={`h-3.5 w-3.5 ${loadingActionId === srv.id ? 'animate-spin' : ''}`} />
                              <span>{t('powerOn')}</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={loadingActionId === srv.id}
                              onClick={() => handlePowerAction(srv.id, 'power_off')}
                              className="h-8 px-2.5 text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                              <Power className={`h-3.5 w-3.5 text-amber-600 ${loadingActionId === srv.id ? 'animate-spin' : ''}`} />
                              <span>{t('powerOff')}</span>
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={loadingActionId === srv.id || srv.status === 'stopped' || srv.status === 'suspended'}
                            onClick={() => handlePowerAction(srv.id, 'reboot')}
                            className="h-8 px-2.5 text-xs gap-1"
                          >
                            <RotateCw className={`h-3.5 w-3.5 text-blue-600 ${loadingActionId === srv.id ? 'animate-spin' : ''}`} />
                            <span>{t('reboot')}</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={loadingActionId === srv.id}
                            onClick={() => {
                              if (confirm(t('confirmDelete'))) {
                                handlePowerAction(srv.id, 'delete');
                              }
                            }}
                            className="h-8 px-2.5 text-xs text-slate-400 hover:text-arvan-rose hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Cloud Storage Volumes & Infrastructure Resources */}
      <Card elevation={1}>
        <CardHeader>
          <CardTitle>
            <HardDrive className="h-5 w-5 text-arvan-teal" />
            <span>{t('Storage Volumes')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={t('Volume Name')}
              value={volName}
              onChange={(e) => setVolName(e.target.value)}
              className="flex h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs"
            />
            <input
              type="number"
              min="10"
              max="2000"
              placeholder={t('Size (GB)')}
              value={volSize}
              onChange={(e) => setVolSize(Number(e.target.value))}
              className="flex h-9 w-24 rounded-xl border border-slate-200 bg-white px-3 text-xs"
            />
            <Button
              size="sm"
              onClick={() => {
                if (onCreateVolume && volName) {
                  onCreateVolume(volName, volSize);
                  setVolName('');
                }
              }}
              className="gap-1 text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('Create Volume')}</span>
            </Button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {(iaasResources?.volumes || []).map((vol) => (
              <div key={vol.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{vol.name}</span>
                  <span className="text-slate-400 ms-2">({vol.sizeGigaBytes} GB &bull; {vol.status})</span>
                </div>
                {onDeleteVolume && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteVolume(vol.id)}
                    className="text-arvan-rose hover:bg-rose-50 h-7 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 6. VPC Networks & Security Firewalls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Private Networks */}
        <Card elevation={1}>
          <CardHeader>
            <CardTitle>
              <Network className="h-5 w-5 text-arvan-teal" />
              <span>{t('Private Networks (VPC)')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('VPC Name')}
                value={netName}
                onChange={(e) => setNetName(e.target.value)}
                className="flex h-9 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs"
              />
              <input
                type="text"
                placeholder="192.168.10.0/24"
                value={netCidr}
                onChange={(e) => setNetCidr(e.target.value)}
                className="flex h-9 w-32 rounded-xl border border-slate-200 bg-white px-3 text-xs"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (onCreateNetwork && netName) {
                    onCreateNetwork(netName, netCidr);
                    setNetName('');
                  }
                }}
                className="text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {(iaasResources?.networks || []).map((net) => (
                <div key={net.id} className="py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-800">{net.name}</span>
                  <span className="font-mono text-slate-500">{net.cidr}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Firewalls */}
        <Card elevation={1}>
          <CardHeader>
            <CardTitle>
              <Shield className="h-5 w-5 text-arvan-teal" />
              <span>{t('Firewalls & Security Groups')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('Firewall Name')}
                value={fwName}
                onChange={(e) => setFwName(e.target.value)}
                className="flex h-9 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs"
              />
              <Button
                size="sm"
                onClick={() => {
                  if (onCreateFirewall && fwName) {
                    onCreateFirewall(fwName);
                    setFwName('');
                  }
                }}
                className="text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {(iaasResources?.firewalls || []).map((fw) => (
                <div key={fw.id} className="py-2 flex items-center justify-between">
                  <span className="font-bold text-slate-800">{fw.name}</span>
                  <Badge variant="outline">{fw.rulesCount || 0} {t('rules')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. Atomic Wallet Ledger Logs */}
      <Card elevation={1}>
        <CardHeader>
          <CardTitle>
            <Wallet className="h-5 w-5 text-arvan-teal" />
            <span>{t('transactionHistory')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {t('noTransactions')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-3.5 px-5 text-start">{t('timestamp')}</th>
                    <th className="py-3.5 px-5 text-start">{t('type')}</th>
                    <th className="py-3.5 px-5 text-start">{t('description')}</th>
                    <th className="py-3.5 px-5 text-start">{t('amount')}</th>
                    <th className="py-3.5 px-5 text-end">{t('balanceSnapshot')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-slate-500 text-[11px]">
                        {formatDate(tx.created_at, language)}
                      </td>
                      <td className="py-3.5 px-5">
                        {tx.type === 'deposit' && (
                          <Badge variant="success" className="gap-1">
                            <ArrowDownLeft className="h-3 w-3" />
                            <span>{t('txDeposit')}</span>
                          </Badge>
                        )}
                        {(tx.type === 'hourly_charge' || (tx.type as string) === 'metered_charge') && (
                          <Badge variant="secondary" className="gap-1 font-mono">
                            <Flame className="h-3 w-3 text-arvan-pink" />
                            <span>{t('txMetered')}</span>
                          </Badge>
                        )}
                        {(tx.type === 'admin_adjustment' || (tx.type as string) === 'adjustment') && (
                          <Badge variant="outline">{t('txAdjustment')}</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-700">{tx.description}</td>
                      <td className="py-3.5 px-5 font-bold font-mono">
                        {tx.amount > 0 ? (
                          <span className="text-arvan-emerald">+{formatCurrency(tx.amount, currency, language)}</span>
                        ) : (
                          <span className="text-slate-900">{formatCurrency(tx.amount, currency, language)}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-end font-mono text-slate-600 font-semibold">
                        {formatCurrency(tx.balance_after, currency, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
