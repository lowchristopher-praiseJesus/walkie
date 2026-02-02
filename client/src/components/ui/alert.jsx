import { cn } from '../../lib/utils'

const alertVariants = {
  success: 'bg-[--color-success]/10 border-[--color-success]/20 text-[--color-success]',
  error: 'bg-[--color-danger]/10 border-[--color-danger]/20 text-[--color-danger]',
}

export function Alert({ className, variant = 'success', children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 px-4 py-3 text-center text-sm font-medium',
        alertVariants[variant],
        className
      )}
      role="alert"
      {...props}
    >
      {children}
    </div>
  )
}
