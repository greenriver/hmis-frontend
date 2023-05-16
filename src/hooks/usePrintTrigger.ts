import { useEffect, useState } from 'react';

import useIsPrintView from './useIsPrintView';
import usePrevious from './usePrevious';

interface Args {
  startReady?: boolean;
  hold?: boolean;
  timeout?: number;
}

const usePrintTrigger = ({
  startReady = true,
  hold = false,
  timeout = 0,
}: Args = {}) => {
  const [shouldPrint, setShouldPrint] = useState<boolean>(startReady);
  const isPrintView = useIsPrintView();
  const prev = usePrevious(isPrintView);

  useEffect(() => {
    if (shouldPrint && !hold)
      setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, timeout);
  }, [shouldPrint, hold, timeout]);

  useEffect(() => {
    if (isPrintView && !prev) setShouldPrint(true);
  }, [isPrintView, prev]);
};

export default usePrintTrigger;
