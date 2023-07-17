import { flatMap } from 'lodash-es';
import { matchRoutes, useLocation } from 'react-router-dom';

import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
  Routes,
} from '@/routes/routes';

const allRoutes = flatMap(
  [
    Routes,
    ClientDashboardRoutes,
    EnrollmentDashboardRoutes,
    ProjectDashboardRoutes,
  ],
  (obj) => Object.values(obj)
).map((s) => ({
  path: s,
}));

export default function useCurrentPath() {
  const location = useLocation();
  const matches = matchRoutes(allRoutes, location);
  if (!matches || matches.length === 0) return;
  return matches[0].route.path;
}
