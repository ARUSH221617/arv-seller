import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Edit,
  DollarSign,
  Search,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import { AdminWalletItem, AdminKpiStats } from '../types';
import { SupportedLanguage } from '../../types';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

interface AdminWalletsViewProps {
  wallets: AdminWalletItem[];
  stats: AdminKpiStats;
  currency: string;
  language: SupportedLanguage;
  t: (key: string) => string;
  onAdjustBalance: (userId: number, type: 'credit' | 'debit', amount: number, reason: string) => Promise<void>;
}

export const AdminWalletsView: React.FC<AdminWalletsViewProps> = ({
  wallets,
  stats,
  currency,
  language,
  t,
  onAdjustBalance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminWalletItem | null>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState<number>(50000);
  const [adjustReason, setAdjustReason] = useState<string>(t('manualAdjustmentDefaultReason'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filtered = wallets.filter((w) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        w.userName.toLowerCase().includes(q) ||
        w.userEmail.toLowerCase().includes(q) ||
        String(w.user_id).includes(q)
      );
    }
    return true;
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || adjustAmount <= 0) return;
    setIsSubmitting(true);
    try {
      await onAdjustBalance(selectedUser.user_id, adjustType, adjustAmount, adjustReason);
      setSelectedUser(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">{t('Customer Wallets & Ledger Audit')}</h2>
        <p className="text-xs text-slate-500 mt-1">
          {t('Real-time atomic ledger oversight, balance snapshots, and manual balance adjustment tools.')}
        </p>
      </div>

      {/* 2. Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card elevation={2}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t('Total Active Wallets')}
            </span>
            <div className="text-2xl font-extrabold text-slate-900">{stats.total_wallets}</div>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t('Total Outstanding Credit')}
            </span>
            <div className="text-2xl font-extrabold text-arvan-teal">
              {formatCurrency(stats.total_credit, currency, language)}
            </div>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t('Cumulative Deposits')}
            </span>
            <div className="text-2xl font-extrabold text-arvan-emerald">
              {formatCurrency(stats.cumulative_deposits, currency, language)}
            </div>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {t('Total Metered Burn')}
            </span>
            <div className="text-2xl font-extrabold text-slate-700">
              {formatCurrency(stats.total_burn, currency, language)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Search Bar */}
      <Card elevation={1}>
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="absolute start-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('searchWalletsPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-10 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* 4. Customer Wallets Table */}
      <Card elevation={1}>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30 text-arvan-teal" />
              <p className="text-xs font-semibold">{t('No customer wallets initialized yet.')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-3.5 px-5 text-start">{t('Wallet ID')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Customer Name')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Email')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Available Balance')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Hourly Burn Rate')}</th>
                    <th className="py-3.5 px-5 text-start">{t('Created At')}</th>
                    <th className="py-3.5 px-5 text-end">{t('Ledger Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filtered.map((wallet) => (
                    <tr key={wallet.user_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5 text-slate-400 font-mono">#{wallet.user_id}</td>
                      <td className="py-4 px-5 font-bold text-slate-900">{wallet.userName}</td>
                      <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">{wallet.userEmail}</td>
                      <td className="py-4 px-5 font-extrabold text-sm">
                        <span className={wallet.balance > 0 ? 'text-arvan-teal' : 'text-arvan-amber'}>
                          {formatCurrency(wallet.balance, currency, language)}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-700">
                        {formatCurrency(wallet.burn_rate, currency, language)} / hr
                      </td>
                      <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                        {formatDate(wallet.created_at, language)}
                      </td>
                      <td className="py-4 px-5 text-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(wallet)}
                          className="h-8 px-3 text-xs gap-1.5 border-arvan-teal/30 hover:bg-arvan-teal/10 text-arvan-teal font-semibold"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>{t('Adjust Balance')}</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Balance Adjustment Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-arvan-teal" />
                <span>{t('Manual Ledger Adjustment')}: {selectedUser.userName}</span>
              </DialogTitle>
              <DialogDescription>
                {t('adjustBalanceDesc')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 py-2">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  {t('Adjustment Type:')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-bold transition-all',
                      adjustType === 'credit'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <ArrowDownLeft className="h-4 w-4" />
                    <span>{t('Credit (+ Deposit Funds)')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-bold transition-all',
                      adjustType === 'debit'
                        ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span>{t('Debit (- Deduct Funds)')}</span>
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  {t('Amount (Toman):')}
                </label>
                <Input
                  type="number"
                  min="1000"
                  step="1000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value) || 0)}
                  className="font-mono font-bold text-arvan-teal"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  {t('Reason / Audit Note:')}
                </label>
                <Input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder={t('adjustReasonPlaceholder')}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setSelectedUser(null)}>
                  {t('Cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || adjustAmount <= 0} className="gap-2 font-bold">
                  {isSubmitting ? (
                    <Sparkles className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>{t('Apply Adjustment')}</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
