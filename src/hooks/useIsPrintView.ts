import { useLocation } from 'react-router-dom';

import useCurrentPath from './useCurrentPath';

import { PRINTABLE_ROUTES } from '@/routes/routes';

const useIsPrintView = () => {
  const hasPrintParam = new URLSearchParams(useLocation().search).has('print');
  const isPrintableRoute = PRINTABLE_ROUTES.includes(useCurrentPath() || '');

  return hasPrintParam && isPrintableRoute;
};

export default useIsPrintView;
