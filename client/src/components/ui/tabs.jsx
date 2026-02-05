import { cn } from '../../lib/utils'

export function Tabs({ className, children, ...props }) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {children}
    </div>
  )
}

export function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex overflow-x-auto rounded-lg bg-zinc-800 p-1 mb-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ className, active, children, ...props }) {
  return (
    <button
      className={cn(
        'flex-shrink-0 rounded-md px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
        active
          ? 'bg-zinc-900 text-zinc-100 shadow-sm'
          : 'text-zinc-400 hover:text-zinc-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ className, children, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}
