import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import usePrevious from '@/hooks/usePrevious';

const useIntermediateState = <T,>(value: T, defaultValue: T = value) => {
  const [state, setState] = useState<T>(value);

  const reset = useCallback(() => setState(defaultValue), [defaultValue]);
  const cancel = useCallback(() => setState(value), [value]);

  const previousValueArg = usePrevious(value);
  useEffect(() => {
    // Synchronize the internal state with the external value when it changes.
    // Deep-equal check since `value` is an object.
    // Example: This handles cases like the user navigating with the browser's back/forward buttons.
    // (It isn't straightforward to lift state up in order to avoid this effect,
    // since the state needs to be both independently updateable and derived from the external value.)
    if (!isEqual(previousValueArg, value)) {
      setState(value);
    }
  }, [previousValueArg, value]);

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
