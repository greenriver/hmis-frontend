import { matchRoutes, useLocation } from 'react-router-dom';

import { DashboardRoutes, Routes } from '@/routes/routes';

const allRoutes = Object.values({ ...Routes, ...DashboardRoutes }).map((s) => ({
  path: s,
}));

export default function useCurrentPath() {
  const location = useLocation();
  const matches = matchRoutes(allRoutes, location);
  if (!matches || matches.length === 0) return;
  return matches[0].route.path;
}
