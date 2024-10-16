import { matchRoutes, useLocation } from 'react-router-dom';

import { allRoutes } from '@/routes/routes';

export default function useCurrentPath() {
  const location = useLocation();
  const matches = matchRoutes(allRoutes, location);
  if (!matches || matches.length === 0) return;
  return matches[0].route.path;
}
