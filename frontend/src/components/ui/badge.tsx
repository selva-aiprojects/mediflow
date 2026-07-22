import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-[#1A2B4C]',
        primary: 'bg-[#eaf3ff] text-[#0053ad]',
        success: 'bg-[#eefbf7] text-[#1f7f62]',
        warning: 'bg-[#fff8e6] text-[#8a5f0a]',
        danger: 'bg-[#fff1f2] text-[#a0162d]',
        outline: 'border border-slate-300 bg-white text-[#1A2B4C]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
