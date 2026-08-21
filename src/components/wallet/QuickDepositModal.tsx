import React, { useState } from 'react';
import { Wallet, CreditCard, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { formatCurrency, cn } from '../../lib/utils';
import { SupportedLanguage } from '../../types';

interface QuickDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => Promise<void>;
  currency: string;
  language: SupportedLanguage;
  t: (key: string) => string;
}

const PRESETS = [50000, 100000, 200000, 500000];

export const QuickDepositModal: React.FC<QuickDepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
  currency,
  language,
  t,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeAmount = customAmount ? Number(customAmount) || 0 : selectedAmount;

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount <= 0) return;
    setIsProcessing(true);
    try {
      await onDeposit(activeAmount);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-arvan-teal/10 text-arvan-teal shadow-sm">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{t('topUp')}</DialogTitle>
              <DialogDescription className="text-xs">
                Instant wallet recharge via online gateway / sandbox demo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleDepositSubmit} className="space-y-4 py-2">
          {/* Preset Chips */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-2 block">
              Select Preset Amount:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => {
                const isSelected = !customAmount && selectedAmount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(preset);
                      setCustomAmount('');
                    }}
                    className={cn(
                      'flex items-center justify-center rounded-2xl border p-3 text-xs font-bold transition-all',
                      isSelected
                        ? 'border-arvan-teal bg-arvan-teal/10 text-arvan-teal shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {formatCurrency(preset, currency, language)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
              {t('customAmount')}:
            </label>
            <div className="relative">
              <Input
                type="number"
                min="1000"
                step="1000"
                placeholder="e.g. 250000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pe-16"
              />
              <span className="absolute end-4 top-3 text-xs font-bold text-slate-400">
                {currency}
              </span>
            </div>
          </div>

          {/* Summary Box */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between">
            <div className="text-xs text-slate-500">Total Deposit Amount:</div>
            <div className="text-base font-extrabold text-arvan-teal">
              {formatCurrency(activeAmount, currency, language)}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isProcessing}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || activeAmount <= 0}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>{t('proceedPayment')}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
