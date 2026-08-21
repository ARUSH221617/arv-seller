import React from 'react';
import { Server, LayoutDashboard, Globe, HardDrive, Plus, Wallet, LogIn } from 'lucide-react';
import { Button } from '../ui/button';
import { ActiveTab, SupportedLanguage } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';

interface TopAppBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  language: SupportedLanguage;
  balance: number;
  currency: string;
  isLogged: boolean;
  loginUrl: string;
  onOpenDeposit: () => void;
  t: (key: string) => string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  activeTab,
  onSelectTab,
  language,
  balance,
  currency,
  isLogged,
  loginUrl,
  onOpenDeposit,
  t,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-sm transition-all">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* 1. Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-arvan-teal to-arvan-teal-light shadow-sm">
            <Server className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                ArvanCloud
              </span>
              <span className="rounded-md bg-arvan-teal/10 px-1.5 py-0.5 text-[10px] font-bold text-arvan-teal-dark">
                Reseller
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {t('storefrontSubtitle')}
            </p>
          </div>
        </div>

        {/* 2. M3 Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/90 p-1.5 shadow-inner">
          <button
            onClick={() => onSelectTab('server')}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200',
              activeTab === 'server'
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            )}
          >
            <Server className="h-4 w-4 text-arvan-teal" />
            <span>{t('deployServer')}</span>
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200',
              activeTab === 'dashboard'
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            )}
          >
            <LayoutDashboard className="h-4 w-4 text-arvan-teal" />
            <span>{t('dashboard')}</span>
          </button>

          <button
            onClick={() => onSelectTab('cdn')}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200',
              activeTab === 'cdn'
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            )}
          >
            <Globe className="h-4 w-4 text-arvan-teal" />
            <span>{t('cdnDns')}</span>
          </button>

          <button
            onClick={() => onSelectTab('storage')}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200',
              activeTab === 'storage'
                ? 'bg-white text-slate-950 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            )}
          >
            <HardDrive className="h-4 w-4 text-arvan-teal" />
            <span>{t('objectStorage')}</span>
          </button>
        </nav>

        {/* 3. Action Cluster (Live Wallet Chip & User CTA) */}
        <div className="flex items-center gap-3">
          {isLogged ? (
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm">
              <Wallet className="h-4 w-4 text-arvan-teal" />
              <div className="flex items-baseline gap-1">
                <span className="font-bold text-slate-900">
                  {formatCurrency(balance, currency, language)}
                </span>
              </div>
              <button
                onClick={onOpenDeposit}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-arvan-teal text-white font-bold hover:bg-arvan-teal-dark transition-transform hover:scale-110 shadow-sm"
                title={t('topUp')}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <a href={loginUrl}>
              <Button size="sm" variant="outline" className="gap-2">
                <LogIn className="h-3.5 w-3.5 text-arvan-teal" />
                <span>{t('signIn')}</span>
              </Button>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
