import React, { useState, useEffect, useMemo } from 'react';
import { useArvan } from './hooks/useArvan';
import { TopAppBar } from './components/navigation/TopAppBar';
import { QuickDepositModal } from './components/wallet/QuickDepositModal';
import { ToastContainer } from './components/ui/toast';
import { ServerConfiguratorView } from './views/ServerConfiguratorView';
import { CustomerDashboardView } from './views/CustomerDashboardView';
import { ActiveTab, EmbedConfig } from './types';
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
    storeName,
    storeTagline,
    heroTitle,
    heroDescription,
    deployButtonText,
    dashboardTitle,
    dashboardDescription,
    walletTitle,
    logoUrl,
    headerStyle,
    showHourlyToggle,
    customFooterText,
    regions,
    flavors,
    images,
    servers,
    transactions,
    toasts,
    removeToast,
    isDepositOpen,
    setIsDepositOpen,
    deployServer,
    handleServerPower,
    topupWallet,
    iaasResources,
    fetchIaasResources,
    createVolume,
    deleteVolume,
    attachVolume,
    detachVolume,
    createNetwork,
    deleteNetwork,
    createFirewall,
    deleteFirewall,
    addFirewallRule,
  } = useArvan();

  // Read embedded dataset from mount node (#arvan-cloud-app)
  const embedConfig = useMemo<EmbedConfig>(() => {
    if (typeof document === 'undefined') return {};
    const rootEl = document.getElementById('arvan-cloud-app');
    if (!rootEl) return {};

    const ds = rootEl.dataset;
    return {
      isEmbedded: ds.embedded === 'true',
      initialView: (ds.view === 'dashboard' ? 'dashboard' : 'server') as ActiveTab,
      initialRegion: ds.region || undefined,
      initialFlavor: ds.flavor || undefined,
      initialImage: ds.image || undefined,
      initialDisk: ds.disk ? parseInt(ds.disk, 10) : undefined,
      accentColor: ds.accentColor || undefined,
      secondaryColor: ds.secondaryColor || undefined,
      colorSurface: ds.colorSurface || undefined,
      colorBackground: ds.colorBg || undefined,
      colorText: ds.colorText || undefined,
      colorBorder: ds.colorBorder || undefined,
      borderRadius: ds.borderRadius ? parseInt(ds.borderRadius, 10) : undefined,
      cardElevation: ds.cardElevation || undefined,
      spacingDensity: ds.spacingDensity || undefined,
      containerWidth: ds.containerWidth || undefined,
      fontFamily: ds.fontFamily || undefined,
      baseFontSize: ds.baseFontSize ? parseInt(ds.baseFontSize, 10) : undefined,
      persianDigits: ds.persianDigits !== undefined ? ds.persianDigits === '1' : undefined,
      ctaText: ds.ctaText || undefined,
      customTitle: ds.customTitle || undefined,
      customTagline: ds.customTagline || undefined,
      dashboardTitle: ds.dashboardTitle || undefined,
      dashboardDescription: ds.dashboardDesc || undefined,
      walletTitle: ds.walletTitle || undefined,
      showHeader: ds.showHeader !== undefined ? ds.showHeader === '1' : true,
      showRegion: ds.showRegion !== undefined ? ds.showRegion === '1' : true,
      showStorage: ds.showStorage !== undefined ? ds.showStorage === '1' : true,
      showOs: ds.showOs !== undefined ? ds.showOs === '1' : true,
      showHourly: ds.showHourly !== undefined ? ds.showHourly === '1' : true,
      customCss: ds.customCss || undefined,
    };
  }, []);

  // Route Resolver based on window.location.pathname or embedConfig
  const resolveInitialTab = (): ActiveTab => {
    if (embedConfig.isEmbedded && embedConfig.initialView) {
      return embedConfig.initialView;
    }
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/cloud-services/dashboard')) return 'dashboard';
      if (path.includes('/cloud-services/server')) return 'server';
    }
    return 'server';
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>(resolveInitialTab);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (!embedConfig.isEmbedded && typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState(null, '', `/cloud-services/${tab}/`);
    }
  };

  useEffect(() => {
    if (embedConfig.isEmbedded) return;
    const handlePopState = () => {
      setActiveTab(resolveInitialTab());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [embedConfig.isEmbedded]);

  return (
    <div
      className={cn('min-h-screen flex flex-col transition-colors', `lang-${language}`)}
      style={{
        backgroundColor: 'var(--arvan-bg, #f8fafc)',
        color: 'var(--arvan-text, #0f172a)',
      }}
      dir={direction}
    >
      {/* 1. M3 Top App Bar – hidden when embedded (widget has its own context) */}
      {!embedConfig.isEmbedded && (
        <TopAppBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          language={language}
          balance={balance}
          currency={currency}
          isLogged={isLogged}
          loginUrl={loginUrl}
          onOpenDeposit={() => setIsDepositOpen(true)}
          t={t}
          storeName={storeName || undefined}
          storeTagline={storeTagline || undefined}
          logoUrl={logoUrl || undefined}
          headerStyle={headerStyle}
        />
      )}

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
            // Admin-panel brand overrides (embed attrs take precedence)
            customTitle={embedConfig.customTitle || heroTitle || (storeName ? storeName : undefined)}
            customTagline={embedConfig.customTagline || heroDescription || (storeTagline ? storeTagline : undefined)}
            ctaButtonText={embedConfig.ctaText || deployButtonText || undefined}
            initialRegionId={embedConfig.initialRegion}
            initialFlavorId={embedConfig.initialFlavor}
            initialImageId={embedConfig.initialImage}
            initialDiskSize={embedConfig.initialDisk}
            showHeader={embedConfig.showHeader}
            showRegionSelector={embedConfig.showRegion}
            showStorageSlider={embedConfig.showStorage}
            showOsSelector={embedConfig.showOs}
            showHourlyPrice={embedConfig.showHourly !== undefined ? embedConfig.showHourly : showHourlyToggle}
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
            customTitle={embedConfig.dashboardTitle || dashboardTitle || undefined}
            customDescription={embedConfig.dashboardDescription || dashboardDescription || undefined}
            walletTitle={embedConfig.walletTitle || walletTitle || undefined}
            iaasResources={iaasResources}
            onFetchIaas={fetchIaasResources}
            onCreateVolume={createVolume}
            onDeleteVolume={deleteVolume}
            onAttachVolume={attachVolume}
            onDetachVolume={detachVolume}
            onCreateNetwork={createNetwork}
            onDeleteNetwork={deleteNetwork}
            onCreateFirewall={createFirewall}
            onDeleteFirewall={deleteFirewall}
            onAddFirewallRule={addFirewallRule}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onServerPower={handleServerPower}
            onNavigateDeploy={() => handleSelectTab('server')}
          />
        )}
      </main>

      {/* 3. Footer – hidden when embedded */}
      {!embedConfig.isEmbedded && (
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium">
              <span className="arvan-dot arvan-dot-green" />
              <span className="text-slate-700">{t('All Cloud Datacenter Regions Operational (99.99% SLA)')}</span>
            </div>
            <div>
              {customFooterText || t('Powered by ArvanCloud Infrastructure Reseller Engine')}
            </div>
          </div>
        </footer>
      )}

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
