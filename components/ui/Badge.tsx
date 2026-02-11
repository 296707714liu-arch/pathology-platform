import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-white hover:bg-primary/90 hover:shadow-md',
        secondary:
          'border-transparent bg-secondary text-white hover:bg-secondary/90 hover:shadow-md',
        destructive:
          'border-transparent bg-red-500 text-white hover:bg-red-600 hover:shadow-md',
        outline: 'text-gray-700 border-gray-200 hover:bg-gray-50 hover:shadow-sm',
        success:
          'border-transparent bg-green-100 text-green-800 hover:bg-green-200 hover:shadow-sm',
        warning:
          'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:shadow-sm',
        info:
          'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 hover:shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
