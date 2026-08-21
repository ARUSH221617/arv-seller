import React, { useState } from 'react';
import {
  Globe,
  Plus,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Lock,
  Layers,
  Sparkles,
  Server,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { CdnDomain, DnsRecord, SupportedLanguage } from '../types';

interface CdnManagementViewProps {
  domains: CdnDomain[];
  language: SupportedLanguage;
  t: (key: string) => string;
  onRegisterDomain: (domain: string) => Promise<void>;
}

export const CdnManagementView: React.FC<CdnManagementViewProps> = ({
  domains,
  t,
  onRegisterDomain,
}) => {
  const [newDomainInput, setNewDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<CdnDomain | null>(null);

  // Mock DNS Records for selected domain
  const [records, setRecords] = useState<DnsRecord[]>([
    { id: 'rec-1', domain_id: 'dom-1', name: '@', type: 'A', value: '185.143.232.44', ttl: 120, cloud_proxied: true },
    { id: 'rec-2', domain_id: 'dom-1', name: 'www', type: 'CNAME', value: 'api.cloud-enterprise.ir', ttl: 120, cloud_proxied: true },
    { id: 'rec-3', domain_id: 'dom-1', name: 'mail', type: 'MX', value: 'mail.cloud-enterprise.ir', ttl: 300, cloud_proxied: false },
  ]);

  const [newRecName, setNewRecName] = useState('');
  const [newRecType, setNewRecType] = useState<'A' | 'CNAME' | 'MX' | 'TXT'>('A');
  const [newRecValue, setNewRecValue] = useState('');
  const [newRecProxy, setNewRecProxy] = useState(true);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;
    setIsSubmitting(true);
    try {
      await onRegisterDomain(newDomainInput.trim());
      setNewDomainInput('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecName || !newRecValue) return;
    const newRecord: DnsRecord = {
      id: `rec-${Date.now()}`,
      domain_id: selectedDomain?.id || 'dom-1',
      name: newRecName,
      type: newRecType,
      value: newRecValue,
      ttl: 120,
      cloud_proxied: newRecProxy,
    };
    setRecords((prev) => [...prev, newRecord]);
    setNewRecName('');
    setNewRecValue('');
  };

  const handleDeleteRecord = (recId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recId));
  };

  return (
    <div className="container py-8 space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {t('cdnTitle')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('cdnDesc')}
        </p>
      </div>

      {/* 2. Connect Domain Form */}
      <Card elevation={1}>
        <CardHeader>
          <CardTitle>
            <Globe className="h-5 w-5 text-arvan-teal" />
            <span>{t('connectDomain')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder={t('domainInput')}
              value={newDomainInput}
              onChange={(e) => setNewDomainInput(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting || !newDomainInput.trim()} className="gap-2 shrink-0">
              {isSubmitting ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{t('connectDomain')}</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 3. Connected Domains List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-5 w-5 text-arvan-teal" />
          <span>{t('activeCdnDomains')}</span>
        </h3>

        {domains.map((dom) => (
          <Card key={dom.id} elevation={2} className="border-slate-200">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-arvan-teal/10 text-arvan-teal">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-slate-900">{dom.domain}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="success">Active on 40+ Global PoPs</Badge>
                      <Badge variant="default" className="gap-1">
                        <Lock className="h-3 w-3" />
                        <span>{t('sslActive')}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDomain(dom)}
                    className="gap-1.5 text-xs"
                  >
                    <Server className="h-3.5 w-3.5 text-arvan-teal" />
                    <span>{t('dnsRecords')}</span>
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                    <RefreshCw className="h-3.5 w-3.5 text-blue-600" />
                    <span>{t('purgeCache')}</span>
                  </Button>
                </div>
              </div>

              {/* Nameservers Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-700">
                  {t('assignedNameservers')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {dom.nameservers.map((ns, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 font-mono text-xs text-arvan-teal font-bold border border-slate-200 shadow-sm">
                      <span>{ns}</span>
                      <ShieldCheck className="h-4 w-4 text-arvan-emerald" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DNS Records Modal */}
      {selectedDomain && (
        <Dialog open={!!selectedDomain} onOpenChange={() => setSelectedDomain(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('dnsRecords')}: {selectedDomain.domain}</DialogTitle>
              <DialogDescription>
                Add and manage DNS zone records with instant Anycast propagation.
              </DialogDescription>
            </DialogHeader>

            {/* Add Record Form */}
            <form onSubmit={handleAddRecord} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-b border-slate-100 pb-4">
              <Input
                placeholder="Name (@ or sub)"
                value={newRecName}
                onChange={(e) => setNewRecName(e.target.value)}
              />
              <select
                value={newRecType}
                onChange={(e) => setNewRecType(e.target.value as any)}
                className="rounded-2xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:border-arvan-teal shadow-sm"
              >
                <option value="A">A</option>
                <option value="CNAME">CNAME</option>
                <option value="MX">MX</option>
                <option value="TXT">TXT</option>
              </select>
              <Input
                placeholder="Target / IP"
                value={newRecValue}
                onChange={(e) => setNewRecValue(e.target.value)}
              />
              <Button type="submit" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </Button>
            </form>

            {/* Records Table */}
            <div className="max-h-60 overflow-y-auto space-y-2 py-2">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
                >
                  <div className="flex items-center gap-3 font-mono">
                    <span className="rounded-md bg-arvan-teal/10 px-2 py-0.5 font-bold text-arvan-teal">
                      {rec.type}
                    </span>
                    <span className="font-bold text-slate-900">{rec.name}</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-slate-700">{rec.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rec.cloud_proxied && (
                      <Badge variant="default" className="text-[10px]">
                        Proxied
                      </Badge>
                    )}
                    <button
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="text-slate-400 hover:text-arvan-rose p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setSelectedDomain(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
