import React from 'react';
import { Server, LayoutDashboard, Plus, Wallet, LogIn } from 'lucide-react';
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
  storeName?: string;
  storeTagline?: string;
  logoUrl?: string;
  headerStyle?: 'glassmorphic' | 'solid' | 'minimal' | 'floating';
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
  storeName,
  storeTagline,
  logoUrl,
  headerStyle = 'glassmorphic',
}) => {
  const isFloating = headerStyle === 'floating';

  return (
    <header
      className={cn(
        'sticky z-[9998] transition-all duration-200',
        `arvan-header-${headerStyle}`,
        isFloating
          ? 'mt-3 mb-2 max-w-[var(--arvan-container-max,1280px)] mx-auto rounded-[var(--arvan-radius,16px)] border shadow-md px-2'
          : 'w-full border-b shadow-sm'
      )}
      style={{
        top: isFloating ? 'calc(var(--wp-admin--admin-bar--height, 0px) + 12px)' : 'var(--wp-admin--admin-bar--height, 0px)',
        backgroundColor: headerStyle === 'minimal' ? 'transparent' : 'var(--arvan-surface, #ffffff)',
        borderColor: 'var(--arvan-border, #e2e8f0)',
      }}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* 1. Brand Identity */}
        <div className="flex items-center gap-3">
          {/* Logo: custom image OR default gradient icon */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={storeName || t('arvanCloud')}
              className="h-10 w-auto max-w-[120px] object-contain rounded-lg"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-arvan-teal to-arvan-teal-light shadow-sm">
              <Server className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                {storeName || t('arvanCloud')}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500">
              {storeTagline || t('storefrontSubtitle')}
            </p>
          </div>
        </div>

        {/* 2. M3 Navigation Pills */}
        <nav
          className="hidden md:flex items-center gap-1.5 border border-slate-200 bg-slate-100/90 p-1.5 shadow-inner"
          style={{ borderRadius: 'calc(var(--arvan-radius, 16px) * 0.9)' }}
        >
          <button
            onClick={() => onSelectTab('server')}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-all duration-200',
              activeTab === 'server'
                ? 'bg-[var(--arvan-primary,#008b8b)] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            )}
            style={{ borderRadius: 'calc(var(--arvan-radius, 16px) * 0.65)' }}
          >
            <Server className={cn('h-4 w-4', activeTab === 'server' ? 'text-white' : 'text-[var(--arvan-primary,#008b8b)]')} />
            <span>{t('deployServer')}</span>
          </button>

          <button
            onClick={() => onSelectTab('dashboard')}
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 text-xs font-bold transition-all duration-200',
              activeTab === 'dashboard'
                ? 'bg-[var(--arvan-primary,#008b8b)] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            )}
            style={{ borderRadius: 'calc(var(--arvan-radius, 16px) * 0.65)' }}
          >
            <LayoutDashboard className={cn('h-4 w-4', activeTab === 'dashboard' ? 'text-white' : 'text-[var(--arvan-primary,#008b8b)]')} />
            <span>{t('dashboard')}</span>
          </button>
        </nav>

        {/* 3. Action Cluster (Live Wallet Chip & User CTA) */}
        <div className="flex items-center gap-3">
          {isLogged ? (
            <div
              className="flex items-center gap-2.5 border border-slate-200 bg-white px-3.5 py-1.5 text-xs shadow-sm"
              style={{ borderRadius: 'var(--arvan-radius, 16px)' }}
            >
              <Wallet className="h-4 w-4 text-[var(--arvan-primary,#008b8b)]" />
              <div className="flex items-baseline gap-1">
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(balance, currency, language)}
                </span>
              </div>
              <button
                onClick={onOpenDeposit}
                className="flex h-6 w-6 items-center justify-center text-white font-bold bg-[var(--arvan-primary,#008b8b)] hover:bg-[var(--arvan-primary-hover,#006d6d)] transition-transform hover:scale-105 shadow-sm"
                style={{ borderRadius: 'calc(var(--arvan-radius, 16px) * 0.45)' }}
                title={t('topUp')}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <a href={loginUrl}>
              <Button size="sm" variant="outline" className="gap-2">
                <LogIn className="h-3.5 w-3.5 text-[var(--arvan-primary,#008b8b)]" />
                <span>{t('signIn')}</span>
              </Button>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
