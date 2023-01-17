import { useEffect, useState } from 'react';

export default function useDebouncedState<T>(
  initialValue: T | (() => T),
  delay = 500
) {
  // Actual current value
  const [value, setValue] = useState<T>(initialValue);
  // Debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [value, setValue, debouncedValue] as const;
}
