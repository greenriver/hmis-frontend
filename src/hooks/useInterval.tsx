import { useEffect, useRef } from 'react';

type TimerHandler = (...args: any[]) => void;

export function useInterval(callback: TimerHandler, delay: number) {
  const savedCallbackRef = useRef<TimerHandler>();

  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) =>
      savedCallbackRef.current && savedCallbackRef.current(...args);

    if (delay !== null) {
      const intervalId = setInterval(handler, delay);
      return () => clearInterval(intervalId);
    }
  }, [delay]);
}
