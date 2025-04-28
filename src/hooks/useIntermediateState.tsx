import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// A custom alternative to useEffect that uses deep comparison to compare
// the effect dependencies (unlike react's useEffect, which shallow compares).
const useCustomEffect = (effect: React.EffectCallback, dependencies: any[]) => {
  const previousDepsRef = useRef<any[]>();

  useEffect(() => {
    if (
      !previousDepsRef.current ||
      !isEqual(previousDepsRef.current, dependencies)
    ) {
      effect();
    }
    previousDepsRef.current = dependencies;
  }, [dependencies, effect]);
};

const useIntermediateState = <T,>(value: T, defaultValue: T = value) => {
  const [state, setState] = useState<T>(value);

  const reset = useCallback(() => setState(defaultValue), [defaultValue]);
  const cancel = useCallback(() => setState(value), [value]);

  // Synchronize the internal state with the external value when it changes.
  // Example: This handles cases like the user navigating with the browser's back/forward buttons.
  // (It isn't straightforward to lift state up in order to avoid this effect,
  // since the state needs to be both independently updateable and derived from the external value.)
  useCustomEffect(() => setState(value), [value]);

  return useMemo(
    () => ({
      state,
      setState,
      reset,
      cancel,
    }),
    [cancel, reset, state]
  );
};

export default useIntermediateState;
