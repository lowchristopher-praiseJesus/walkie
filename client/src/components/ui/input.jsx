import { cn } from '../../lib/utils'

export function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-12 w-full rounded-lg border-2 border-zinc-700 bg-zinc-800 px-4 text-base text-zinc-100',
        'placeholder:text-zinc-500',
        'focus:outline-none focus:border-[--color-primary]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}

export function PinInput({ className, ...props }) {
  return (
    <Input
      className={cn(
        'text-center text-3xl tracking-[1rem] font-mono',
        className
      )}
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={4}
      {...props}
    />
  )
}
