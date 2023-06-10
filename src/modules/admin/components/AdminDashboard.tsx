import { Container, Typography } from '@mui/material';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import DashboardContentContainer from '@/components/layout/dashboard/DashboardContentContainer';
import SideNavMenu from '@/components/layout/dashboard/sideNav/SideNavMenu';
import { NavItem } from '@/components/layout/dashboard/sideNav/types';
import { useDashboardState } from '@/hooks/useDashboardState';
import { Routes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectNavHeader: React.FC = () => {
  return (
    <Typography
      variant='h5'
      sx={({ typography }) => ({ fontWeight: typography.fontWeightBold })}
    >
      Admin
    </Typography>
  );
};

const AdminDashboard: React.FC = () => {
  const navItems: NavItem[] = useMemo(() => {
    return [
      {
        id: 'admin-nav',
        type: 'category',
        items: [
          {
            id: 'denials',
            title: 'Denials',
            path: generateSafePath(Routes.ADMIN_REFERRAL_DENIALS),
          },
        ],
      },
    ];
  }, []);

  const dashboardState = useDashboardState();

  return (
    <DashboardContentContainer
      navHeader={<ProjectNavHeader />}
      sidebar={<SideNavMenu items={navItems} />}
      {...dashboardState}
    >
      <Container maxWidth='lg' sx={{ pb: 6 }}>
        <Outlet />
      </Container>
    </DashboardContentContainer>
  );
};

export default AdminDashboard;
