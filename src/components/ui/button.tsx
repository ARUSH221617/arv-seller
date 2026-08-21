import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--arvan-primary,#008b8b)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--arvan-primary,#008b8b)] text-white font-bold hover:bg-[var(--arvan-primary-hover,#006d6d)] shadow-sm hover:shadow-md transition-all',
        tonal:
          'bg-[var(--arvan-primary-light,#e6f7f7)] text-[var(--arvan-primary,#008b8b)] hover:bg-[var(--arvan-primary-light,#e6f7f7)]/80 border border-[var(--arvan-primary,#008b8b)]/30 font-semibold',
        destructive:
          'bg-[var(--arvan-error,#ef4444)] text-white hover:bg-rose-700 shadow-sm hover:shadow-md',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-50 hover:border-[var(--arvan-primary,#008b8b)] hover:text-[var(--arvan-primary,#008b8b)] text-slate-800 shadow-sm',
        secondary:
          'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/60',
        ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900',
        link: 'text-[var(--arvan-primary,#008b8b)] underline-offset-4 hover:underline font-semibold',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs rounded-lg',
        lg: 'h-12 px-7 text-base font-extrabold rounded-2xl',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
