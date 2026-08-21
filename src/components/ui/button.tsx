import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arvan-teal focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-arvan-teal text-white font-bold hover:bg-arvan-teal-dark shadow-sm hover:shadow-md transition-shadow',
        tonal:
          'bg-arvan-teal/10 text-arvan-teal-dark hover:bg-arvan-teal/20 border border-arvan-teal/30 font-semibold',
        destructive:
          'bg-arvan-rose text-white hover:bg-rose-700 shadow-sm hover:shadow-md',
        outline:
          'border border-slate-200 bg-white hover:bg-slate-50 hover:border-arvan-teal/40 text-slate-800 shadow-sm',
        secondary:
          'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/60',
        ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900',
        link: 'text-arvan-teal underline-offset-4 hover:underline font-semibold',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-7 text-base font-semibold',
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
