import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../../hooks/useArvan';
import { cn } from '../../lib/utils';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
  direction?: 'rtl' | 'ltr';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  direction = 'rtl',
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4',
        direction === 'rtl' ? 'left-4' : 'right-4'
      )}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-2xl backdrop-blur-lg border transition-all duration-300 animate-in slide-in-from-bottom-5',
            toast.type === 'success' && 'bg-m3-surface-3/95 border-arvan-emerald/40 text-slate-100',
            toast.type === 'error' && 'bg-m3-surface-3/95 border-arvan-rose/40 text-slate-100',
            toast.type === 'warning' && 'bg-m3-surface-3/95 border-arvan-amber/40 text-slate-100',
            toast.type === 'info' && 'bg-m3-surface-3/95 border-arvan-teal/40 text-slate-100'
          )}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-arvan-emerald shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-arvan-rose shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-arvan-amber shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-arvan-teal shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>

          <button
            onClick={() => onRemove(toast.id)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
