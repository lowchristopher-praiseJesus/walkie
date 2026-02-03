import { cn } from '../../lib/utils'

const buttonVariants = {
  variant: {
    default: 'bg-[--color-primary] text-white hover:bg-[--color-primary]/90 shadow-xl shadow-[--color-primary]/40 ring-2 ring-white/20 border border-white/30',
    secondary: 'bg-[--color-success] text-white hover:bg-[--color-success]/90 shadow-xl shadow-[--color-success]/40 ring-2 ring-white/20 border border-white/30',
    destructive: 'bg-[--color-danger] text-white hover:bg-[--color-danger]/90 shadow-xl shadow-[--color-danger]/40 ring-2 ring-white/20 border border-white/30',
    outline: 'border-2 border-zinc-500 bg-transparent text-zinc-100 hover:bg-zinc-800 shadow-xl shadow-black/30',
    ghost: 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
  },
  size: {
    default: 'h-12 px-6 text-base',
    sm: 'h-9 px-4 text-sm',
    lg: 'h-20 px-8 text-xl',
  },
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-100',
        'active:scale-[0.98] active:opacity-90',
        'disabled:pointer-events-none disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
