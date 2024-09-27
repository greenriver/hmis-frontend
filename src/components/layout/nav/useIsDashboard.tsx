import {
  AdminDashboardRoutes,
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/app/routes';
import useCurrentPath from '@/hooks/useCurrentPath';

export const useIsDashboard = () => {
  const currentPath = useCurrentPath();

  if (!currentPath) return false;

  return (
    Object.values(AdminDashboardRoutes).includes(currentPath) ||
    Object.values(ProjectDashboardRoutes).includes(currentPath) ||
    Object.values(ClientDashboardRoutes).includes(currentPath) ||
    Object.values(EnrollmentDashboardRoutes).includes(currentPath)
  );
};
