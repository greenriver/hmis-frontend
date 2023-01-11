import { useEffect } from 'react';

export default function useDebouncedHandler<T>(
  handler: (value: T) => void,
  watchedValue: T,
  delay: number
) {
  useEffect(() => {
    const timeoutHandler = setTimeout(() => {
      handler(watchedValue);
    }, delay);
    return () => {
      clearTimeout(timeoutHandler);
    };
  }, [watchedValue, delay, handler]);
}
