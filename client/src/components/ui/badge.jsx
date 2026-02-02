import { cn } from '../../lib/utils'

const badgeVariants = {
  default: 'bg-zinc-700 text-zinc-100',
  warning: 'bg-[--color-warning]/20 text-[--color-warning]',
  success: 'bg-[--color-success]/20 text-[--color-success]',
  danger: 'bg-[--color-danger]/20 text-[--color-danger]',
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
