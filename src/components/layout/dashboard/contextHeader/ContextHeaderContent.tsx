import { Box } from '@mui/material';

import { useDashboardBreadcrumbs } from './useDashboardBreadcrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import { DashboardContext } from '@/components/pages/ClientDashboard';

interface Props {
  breadcrumbOverrides?: Record<string, string>; // Path => Title
  dashboardContext: DashboardContext;
}

const ContextHeaderContent: React.FC<Props> = ({
  breadcrumbOverrides,
  dashboardContext,
}) => {
  const breadcrumbs = useDashboardBreadcrumbs(
    dashboardContext,
    breadcrumbOverrides
  );

  // if (breadcrumbs.length < 2) return null;
  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      flex={1}
    >
      <Breadcrumbs crumbs={breadcrumbs} />
    </Box>
  );
};

export default ContextHeaderContent;
