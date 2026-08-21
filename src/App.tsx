import React, { useState, useEffect } from 'react';
import { useArvan } from './hooks/useArvan';
import { TopAppBar } from './components/navigation/TopAppBar';
import { QuickDepositModal } from './components/wallet/QuickDepositModal';
import { ToastContainer } from './components/ui/toast';
import { ServerConfiguratorView } from './views/ServerConfiguratorView';
import { CustomerDashboardView } from './views/CustomerDashboardView';
import { CdnManagementView } from './views/CdnManagementView';
import { ObjectStorageView } from './views/ObjectStorageView';
import { ActiveTab } from './types';
import { cn } from './lib/utils';

export const App: React.FC = () => {
  const {
    language,
    direction,
    setLanguage,
    t,
    balance,
    burnRate,
    remainingHours,
    currency,
    isLogged,
    loginUrl,
    regions,
    flavors,
    images,
    servers,
    transactions,
    domains,
    buckets,
    toasts,
    removeToast,
    isDepositOpen,
    setIsDepositOpen,
    deployServer,
    handleServerPower,
    topupWallet,
    registerCdn,
    createBucket,
  } = useArvan();

  // Route Resolver based on window.location.pathname
  const resolveInitialTab = (): ActiveTab => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/cloud-services/server')) return 'server';
      if (path.includes('/cloud-services/cdn')) return 'cdn';
      if (path.includes('/cloud-services/storage')) return 'storage';
      if (path.includes('/cloud-services/dashboard')) return 'dashboard';
    }
    return 'server';
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(resolveInitialTab);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState(null, '', `/cloud-services/${tab}/`);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(resolveInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className={cn('min-h-screen bg-slate-50 text-slate-900 flex flex-col', `lang-${language}`)} dir={direction}>
      {/* 1. M3 Top App Bar */}
      <TopAppBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        language={language}
        onSelectLanguage={setLanguage}
        balance={balance}
        currency={currency}
        isLogged={isLogged}
        loginUrl={loginUrl}
        onOpenDeposit={() => setIsDepositOpen(true)}
        t={t}
      />

      {/* 2. Main Content View */}
      <main className="flex-1">
        {activeTab === 'server' && (
          <ServerConfiguratorView
            regions={regions}
            flavors={flavors}
            images={images}
            balance={balance}
            currency={currency}
            language={language}
            t={t}
            onDeploy={deployServer}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <CustomerDashboardView
            balance={balance}
            burnRate={burnRate}
            remainingHours={remainingHours}
            servers={servers}
            transactions={transactions}
            currency={currency}
            language={language}
            t={t}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onServerPower={handleServerPower}
            onNavigateDeploy={() => handleSelectTab('server')}
          />
        )}

        {activeTab === 'cdn' && (
          <CdnManagementView
            domains={domains}
            language={language}
            t={t}
            onRegisterDomain={registerCdn}
          />
        )}

        {activeTab === 'storage' && (
          <ObjectStorageView
            buckets={buckets}
            language={language}
            t={t}
            onCreateBucket={createBucket}
          />
        )}
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <span className="arvan-dot arvan-dot-green" />
            <span className="text-slate-700">{t('All Cloud Datacenter Regions Operational (99.99% SLA)')}</span>
          </div>
          <div>
            {t('Powered by ArvanCloud Infrastructure Reseller Engine')}
          </div>
        </div>
      </footer>

      {/* 4. Quick Deposit Modal */}
      <QuickDepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={topupWallet}
        currency={currency}
        language={language}
        t={t}
      />

      {/* 5. Global Toast Container */}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        direction={direction}
      />
    </div>
  );
};
