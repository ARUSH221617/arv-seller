import React, { useState } from 'react';
import {
  HardDrive,
  Plus,
  Key,
  Copy,
  Check,
  Globe2,
  FolderArchive,
  Terminal,
  Sparkles,
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
import { StorageBucket, SupportedLanguage } from '../types';

interface ObjectStorageViewProps {
  buckets: StorageBucket[];
  language: SupportedLanguage;
  t: (key: string) => string;
  onCreateBucket: (name: string) => Promise<void>;
}

export const ObjectStorageView: React.FC<ObjectStorageViewProps> = ({
  buckets,
  t,
  onCreateBucket,
}) => {
  const [newBucketName, setNewBucketName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCredsOpen, setIsCredsOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mockCreds = {
    accessKey: 'AKIA_ARVAN_982F71B39D',
    secretKey: 'sec_98a7bc12d09fe3451a89c34d092e118a994',
    endpointUrl: 'https://s3.ir-thr-c2.arvanstorage.ir',
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = newBucketName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!sanitized) return;
    setIsSubmitting(true);
    try {
      await onCreateBucket(sanitized);
      setNewBucketName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="container py-8 space-y-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {t('storageTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('storageDesc')}
          </p>
        </div>
        <Button onClick={() => setIsCredsOpen(true)} variant="outline" className="gap-2 shrink-0">
          <Key className="h-4 w-4 text-arvan-teal" />
          <span>{t('viewApiKeys')}</span>
        </Button>
      </div>

      {/* 2. Create Bucket Form */}
      <Card elevation={1}>
        <CardHeader>
          <CardTitle>
            <FolderArchive className="h-5 w-5 text-arvan-teal" />
            <span>{t('createBucket')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder={t('bucketName')}
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value.toLowerCase())}
              className="flex-1 font-mono"
            />
            <Button type="submit" disabled={isSubmitting || !newBucketName.trim()} className="gap-2 shrink-0">
              {isSubmitting ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{t('createBucket')}</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 3. Existing Buckets Table */}
      <Card elevation={1}>
        <CardHeader>
          <CardTitle>
            <HardDrive className="h-5 w-5 text-arvan-teal" />
            <span>{t('existingBuckets')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-[11px] font-semibold">
                <tr>
                  <th className="py-3.5 px-5 text-start">{t('bucketIdentifier')}</th>
                  <th className="py-3.5 px-5 text-start">{t('s3EndpointUrl')}</th>
                  <th className="py-3.5 px-5 text-start">{t('clusterRegion')}</th>
                  <th className="py-3.5 px-5 text-start">{t('rateMonthly')}</th>
                  <th className="py-3.5 px-5 text-end">{t('action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {buckets.map((bkt) => (
                  <tr key={bkt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-900 text-sm">
                        <FolderArchive className="h-4 w-4 text-arvan-teal" />
                        <span>{bkt.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-600">
                      https://{bkt.endpoint}/{bkt.name}
                    </td>
                    <td className="py-4 px-5">
                      <Badge variant="secondary" className="font-mono">
                        <Globe2 className="h-3 w-3 me-1 text-arvan-teal" />
                        {bkt.region}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 font-bold text-arvan-teal">
                      4,500 IRT / 100 GB
                    </td>
                    <td className="py-4 px-5 text-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCredsOpen(true)}
                        className="h-8 px-3 text-xs gap-1.5"
                      >
                        <Key className="h-3.5 w-3.5 text-arvan-teal" />
                        <span>{t('credentials')}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* S3 Credentials Modal */}
      <Dialog open={isCredsOpen} onOpenChange={setIsCredsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-arvan-teal" />
              <span>{t('viewApiKeys')}</span>
            </DialogTitle>
            <DialogDescription>
              {t('s3CredsDesc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 font-mono text-xs">
            {/* Endpoint */}
            <div>
              <label className="text-slate-600 block mb-1 font-sans font-semibold">{t('endpointUrl')}:</label>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-arvan-teal font-bold">{mockCreds.endpointUrl}</span>
                <button
                  onClick={() => handleCopy(mockCreds.endpointUrl, 'ep')}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  {copiedKey === 'ep' ? <Check className="h-4 w-4 text-arvan-emerald" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Access Key */}
            <div>
              <label className="text-slate-600 block mb-1 font-sans font-semibold">{t('accessKey')}:</label>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-900 font-bold">{mockCreds.accessKey}</span>
                <button
                  onClick={() => handleCopy(mockCreds.accessKey, 'ak')}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  {copiedKey === 'ak' ? <Check className="h-4 w-4 text-arvan-emerald" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <label className="text-slate-600 block mb-1 font-sans font-semibold">{t('secretKey')}:</label>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200">
                <span className="text-slate-900 font-bold">{mockCreds.secretKey}</span>
                <button
                  onClick={() => handleCopy(mockCreds.secretKey, 'sk')}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  {copiedKey === 'sk' ? <Check className="h-4 w-4 text-arvan-emerald" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* CLI Snippet */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 space-y-2 text-slate-100">
              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 font-sans">
                <Terminal className="h-3.5 w-3.5 text-arvan-teal" />
                <span>{t('awsCliExample')}</span>
              </div>
              <pre className="text-[11px] text-slate-300 overflow-x-auto leading-relaxed font-mono">
{`aws configure set aws_access_key_id ${mockCreds.accessKey}
aws configure set aws_secret_access_key ${mockCreds.secretKey}
aws s3 ls --endpoint-url ${mockCreds.endpointUrl}`}
              </pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="default" onClick={() => setIsCredsOpen(false)}>
              {t('done')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
