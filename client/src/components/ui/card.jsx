import { cn } from '../../lib/utils'

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-zinc-800 bg-zinc-900 p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold text-zinc-100', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('text-zinc-300', className)} {...props}>
      {children}
    </div>
  )
}
