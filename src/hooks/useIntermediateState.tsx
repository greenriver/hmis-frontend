import { useCallback, useMemo, useState } from 'react';

const useIntermediateState = <T,>(value: T, defaultValue: T = value) => {
  const [state, setState] = useState<T>(value);

  const reset = useCallback(() => setState(defaultValue), [defaultValue]);
  const cancel = useCallback(() => setState(value), [value]);

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
