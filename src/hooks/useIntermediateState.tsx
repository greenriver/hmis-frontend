import { useCallback, useEffect, useMemo, useState } from 'react';

const useIntermediateState = <T,>(value: T, defaultValue: T = value) => {
  const [state, setState] = useState<T>(value);

  const reset = useCallback(() => setState(defaultValue), [defaultValue]);
  const cancel = useCallback(() => setState(value), [value]);

  // Synchronize the internal state with the external value when it changes.
  // Example: This handles cases like the user navigating with the browser's back/forward buttons.
  // (It isn't straightforward to lift state up in order to avoid this effect,
  // since the state needs to be both independently updateable and derived from the external value.)
  useEffect(() => setState(value), [value]);

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
