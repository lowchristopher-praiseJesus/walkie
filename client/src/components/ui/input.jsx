import { useState, useEffect, useRef } from 'react'
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

export function PinInput({ className, value = '', onChange, ...props }) {
  const [revealIndex, setRevealIndex] = useState(-1);
  const timeoutRef = useRef(null);
  const prevLengthRef = useRef(0);

  // Build display value: all asterisks except the last typed digit (briefly)
  const getDisplayValue = () => {
    if (!value) return '';
    return value.split('').map((char, i) => {
      if (i === revealIndex) return char;
      return '*';
    }).join('');
  };

  useEffect(() => {
    const currentLength = value?.length || 0;
    const prevLength = prevLengthRef.current;

    // New digit was added
    if (currentLength > prevLength && currentLength > 0) {
      const newIndex = currentLength - 1;
      setRevealIndex(newIndex);

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Hide after 0.5 seconds
      timeoutRef.current = setTimeout(() => {
        setRevealIndex(-1);
      }, 500);
    } else if (currentLength < prevLength) {
      // Digit was removed
      setRevealIndex(-1);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }

    prevLengthRef.current = currentLength;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const displayValue = getDisplayValue();

    if (inputValue.length < displayValue.length) {
      // User deleted - remove last character from actual value
      const newValue = value.slice(0, -1);
      onChange?.({ target: { value: newValue } });
    } else if (inputValue.length > displayValue.length) {
      // User added digit(s) - extract only the truly new characters
      const addedChars = inputValue.slice(displayValue.length).replace(/[^0-9]/g, '');
      if (addedChars.length > 0) {
        const newValue = (value + addedChars).slice(0, 4);
        onChange?.({ target: { value: newValue } });
      }
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={4}
      value={getDisplayValue()}
      onChange={handleChange}
      className={cn(
        'flex h-12 w-full rounded-lg border-2 border-zinc-700 bg-zinc-800 px-4 text-base text-zinc-100',
        'placeholder:text-zinc-500',
        'focus:outline-none focus:border-[--color-primary]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'text-center text-3xl tracking-[1rem] font-mono',
        className
      )}
      {...props}
    />
  )
}
