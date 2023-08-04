import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import useCurrentPath from './useCurrentPath';

import { PRINTABLE_ROUTES } from '@/routes/routes';

const useIsPrintView = () => {
  const location = useLocation();
  const currentPath = useCurrentPath();

  const isPrintView = useMemo(() => {
    const hasPrintParam = new URLSearchParams(location.search).has('print');
    const isPrintableRoute = PRINTABLE_ROUTES.includes(currentPath || '');

    return hasPrintParam && isPrintableRoute;
  }, [location, currentPath]);

  return isPrintView;
};

export default useIsPrintView;
