import { useCallback, useState, useEffect, useRef } from 'react';

let counter = 0;

const useLocalStorage = <T>(key: string, initialValue?: T) => {
  const idRef = useRef<string>(String((counter += 1)));
  const [storedValue, setStoredValue] = useState<T | undefined>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback<typeof setStoredValue>(
    (value) => {
      try {
        setStoredValue((storedValue) => {
          const valueToStore =
            value instanceof Function ? value(storedValue) : value;
          localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
        window.dispatchEvent(
          new CustomEvent('storeLocalValue', {
            detail: { key, id: idRef.current },
          })
        );
      } catch (error) {
        console.error(error);
      }
    },
    [key]
  );

  const handleStorage = useCallback(() => {
    const item: string | null = localStorage.getItem(key);
    const value = item ? JSON.parse(item) : initialValue;
    setStoredValue(value);
  }, [setStoredValue, key, initialValue]);

  useEffect(() => {
    const handler = (evt: any) => {
      const { key: evtKey, id } = (evt as CustomEvent).detail;
      if (evtKey && evtKey === key && id !== idRef.current) handleStorage();
    };
    window.addEventListener('storeLocalValue', handler);
    return () => window.removeEventListener('storeLocalValue', handler);
  });

  return [storedValue, setValue] as const;
};

export default useLocalStorage;
