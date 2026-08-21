import React, { useState } from 'react';
import { useAdminData } from './useAdminData';
import { AdminSettingsView } from './views/AdminSettingsView';
import { AdminResourcesView } from './views/AdminResourcesView';
import { AdminWalletsView } from './views/AdminWalletsView';
import { ToastContainer } from '../components/ui/toast';
import { Server, Settings, Wallet, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminApp: React.FC = () => {
  const {
    language,
    direction,
    setLanguage,
    t,
    settings,
    stats,
    resources,
    wallets,
    toasts,
    removeToast,
    testApiConnection,
    saveSettings,
    handleResourceAction,
    adjustBalance,
  } = useAdminData();

  const resolveInitialTab = (): 'settings' | 'resources' | 'wallets' => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get('page');
      if (page === 'arvan-reseller-resources') return 'resources';
      if (page === 'arvan-reseller-wallets') return 'wallets';
    }
    return 'settings';
  };

  const [activeTab, setActiveTab] = useState<'settings' | 'resources' | 'wallets'>(resolveInitialTab);

  return (
    <div className={cn('min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 rounded-3xl', `lang-${language}`)} dir={direction}>
      {/* 1. Admin Header Shell */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6 mb-8 bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-arvan-teal to-arvan-teal-light shadow-sm">
            <Server className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900">
                {t('ArvanCloud Reseller')}
              </h1>
              <span className="rounded-md bg-arvan-teal/10 px-2 py-0.5 text-[10px] font-bold text-arvan-teal-dark">
                {t('backOffice')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('Enterprise Multi-Tenant Infrastructure Management & Monetization')}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 p-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                activeTab === 'settings'
                  ? 'bg-arvan-teal text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              <Settings className="h-3.5 w-3.5" />
              <span>{t('Settings & API')}</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                activeTab === 'resources'
                  ? 'bg-arvan-teal text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t('Cloud Resources')}</span>
            </button>

            <button
              onClick={() => setActiveTab('wallets')}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                activeTab === 'wallets'
                  ? 'bg-arvan-teal text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              )}
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>{t('Wallets & Ledger')}</span>
            </button>
          </nav>
        </div>
      </header>

      {/* 2. Admin Views */}
      <main>
        {activeTab === 'settings' && (
          <AdminSettingsView
            settings={settings}
            language={language}
            t={t}
            onSave={saveSettings}
            onTestConnection={testApiConnection}
          />
        )}

        {activeTab === 'resources' && (
          <AdminResourcesView
            resources={resources}
            stats={stats}
            currency={settings.currency}
            language={language}
            t={t}
            onAction={handleResourceAction}
          />
        )}

        {activeTab === 'wallets' && (
          <AdminWalletsView
            wallets={wallets}
            stats={stats}
            currency={settings.currency}
            language={language}
            t={t}
            onAdjustBalance={adjustBalance}
          />
        )}
      </main>

      {/* 3. Toast Container */}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        direction={direction}
      />
    </div>
  );
};
