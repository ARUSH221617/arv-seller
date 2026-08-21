import React, { useState } from 'react';
import {
  Server,
  RefreshCw,
  Power,
  Trash2,
  Search,
  DollarSign,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { AdminResourceItem, AdminKpiStats } from '../types';
import { SupportedLanguage } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface AdminResourcesViewProps {
  resources: AdminResourceItem[];
  stats: AdminKpiStats;
  currency: string;
  language: SupportedLanguage;
  t: (key: string) => string;
  onAction: (resourceId: number, actionType: 'power_off' | 'force_delete' | 'trigger_metering') => Promise<void>;
}

export const AdminResourcesView: React.FC<AdminResourcesViewProps> = ({
  resources,
  stats,
  currency,
  language,
  t,
  onAction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'stopped'>('all');
  const [isMetering, setIsMetering] = useState(false);

  const filtered = resources.filter((res) => {
    if (statusFilter !== 'all' && res.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        res.name.toLowerCase().includes(q) ||
        res.userName.toLowerCase().includes(q) ||
        res.arvan_resource_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleTriggerMetering = async () => {
    setIsMetering(true);
    try {
      await onAction(0, 'trigger_metering');
    } finally {
      setIsMetering(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Metering Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">{t('All Provisioned Cloud Resources')}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('Master oversight and lifecycle controls across all customer cloud instances, domains, and buckets.')}
          </p>
        </div>
        <Button
          onClick={handleTriggerMetering}
          disabled={isMetering}
          className="gap-2 shrink-0 font-bold"
        >
          <RefreshCw className={`h-4 w-4 ${isMetering ? 'animate-spin' : ''}`} />
          <span>{t('Run Metering Cycle Now')}</span>
        </Button>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card elevation={2}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t('Total Cloud Instances')}
            </span>
            <div className="text-2xl font-extrabold text-slate-900">{stats.total_vms}</div>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t('Active / Running')}
            </span>
            <div className="text-2xl font-extrabold text-arvan-emerald flex items-center gap-2">
              <span className="arvan-dot arvan-dot-green" />
              <span>{stats.total_active}</span>
            </div>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t('Suspended (0 Balance)')}
            </span>
            <div className="text-2xl font-extrabold text-arvan-amber flex items-center gap-2">
              <span className="arvan-dot arvan-dot-amber" />
              <span>{stats.total_suspended}</span>
            </div>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t('Monthly Run Rate (MRR)')}
            </span>
            <div className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(stats.total_mrr, currency, language)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search and Status Filter */}
      <Card elevation={1}>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute start-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('searchResourcesPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
              className="text-xs h-9"
            >
              {t('all')} ({resources.length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('active')}
              className="text-xs h-9"
            >
              {t('active')} ({resources.filter((r) => r.status === 'active').length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'suspended' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('suspended')}
              className="text-xs h-9"
            >
              {t('suspended')} ({resources.filter((r) => r.status === 'suspended').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 4. Master Resources Table */}
      <Card elevation={1}>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Server className="h-10 w-10 mx-auto mb-2 opacity-30 text-arvan-teal" />
              <p className="text-xs font-semibold">{t('No resources deployed yet.')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-3.5 px-5 text-start">ID</th>
                    <th className="py-3.5 px-5 text-start">{t('Customer')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Resource Name')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Service')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Arvan UUID / Identifier')}</th>
                    <th className="py-3.5 px-5 text-start">{t('region')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Hourly Rate')}</th>
                    <th className="py-3.5 px-5 text-start">{t('status')}</th>
                    <th className="py-3.5 px-5 text-end">{t('Emergency Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filtered.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 text-slate-400 font-mono">#{res.id}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">{res.userName}</td>
                      <td className="py-4 px-5 font-semibold text-slate-800">{res.name}</td>
                      <td className="py-4 px-5 font-mono text-[11px] text-arvan-teal">{res.service_type}</td>
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-600">{res.arvan_resource_id}</td>
                      <td className="py-4 px-5 font-medium text-slate-600">{res.region}</td>
                      <td className="py-4 px-5 font-bold text-arvan-teal">
                        {formatCurrency(res.hourly_rate, currency, language)} / {t('hr')}
                      </td>
                      <td className="py-4 px-5">
                        {res.status === 'active' && (
                          <Badge variant="success">
                            <span className="arvan-dot arvan-dot-green" />
                            <span>{t('active')}</span>
                          </Badge>
                        )}
                        {res.status === 'suspended' && (
                          <Badge variant="warning">
                            <span className="arvan-dot arvan-dot-amber" />
                            <span>{t('suspended')}</span>
                          </Badge>
                        )}
                        {res.status === 'stopped' && (
                          <Badge variant="destructive">
                            <span className="arvan-dot arvan-dot-red" />
                            <span>{t('stopped')}</span>
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAction(res.id, 'power_off')}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            <Power className="h-3 w-3 text-arvan-amber" />
                            <span>{t('Power Off')}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm(t('Are you sure you want to permanently delete this resource from ArvanCloud?'))) {
                                onAction(res.id, 'force_delete');
                              }
                            }}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>{t('Purge')}</span>
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
    </div>
  );
};
