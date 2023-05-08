import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';

import usePrevious from '@/hooks/usePrevious';

const useStabilizedValue = <T,>(value: T) => {
  const [stabilized, setStabilized] = useState<T>(value);
  const prev = usePrevious(value);

  useEffect(() => {
    if (!isEqual(value, prev)) setStabilized(value);
  }, [value, prev]);

  return stabilized;
};

export default useStabilizedValue;
