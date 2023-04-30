import { Box } from '@mui/material';

import { CONTEXT_HEADER_HEIGHT } from '../../layoutConstants';

import { useDashboardBreadcrumbs } from './useDashboardBreadcrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import { ClientDashboardContext } from '@/components/pages/ClientDashboard';
import { ProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

interface Props {
  breadcrumbOverrides?: Record<string, string>; // Path => Title
  dashboardContext: ClientDashboardContext | ProjectDashboardContext;
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
      sx={{ pl: 3 }}
    >
      <Breadcrumbs
        crumbs={breadcrumbs}
        sx={{
          '.MuiBreadcrumbs-ol': {
            overflow: 'hidden',
            height: CONTEXT_HEADER_HEIGHT,
          },
        }}
      />
    </Box>
  );
};

export default ContextHeaderContent;
