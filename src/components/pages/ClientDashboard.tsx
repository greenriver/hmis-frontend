import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Container, Tab, Typography } from '@mui/material';
import { useEffect, useState, useMemo } from 'react';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import useClient from '@/hooks/useClient';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { Client } from '@/types/gqlTypes';

const tabs = [
  {
    label: 'Profile',
    path: DashboardRoutes.PROFILE,
  },
  {
    label: 'Enrollments',
    path: DashboardRoutes.ALL_ENROLLMENTS,
  },
  {
    label: 'History',
    path: DashboardRoutes.HISTORY,
  },
  {
    label: 'Assessments',
    path: DashboardRoutes.ASSESSMENTS,
  },
  {
    label: 'Notes',
    path: DashboardRoutes.NOTES,
  },
  {
    label: 'Files',
    path: DashboardRoutes.FILES,
  },
  {
    label: 'Contact',
    path: DashboardRoutes.CONTACT,
  },
  {
    label: 'Locations',
    path: DashboardRoutes.LOCATIONS,
  },
  {
    label: 'Referrals',
    path: DashboardRoutes.REFERRALS,
  },
];

const getTabFromPath = (pathname: string, tabs: { path: string }[]) => {
  return (
    tabs.find(({ path }) => pathname.includes(`/${path}`))?.path || tabs[0].path
  );
};

const ClientDashboard: React.FC = () => {
  const { clientId } = useParams() as { clientId: string };
  const [client, loading] = useClient(clientId);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const baseRoute = `/client/${clientId}`;

  const initialTab = useMemo(() => getTabFromPath(pathname, tabs), [pathname]);
  const outletContext = useMemo(
    () => ({
      client,
    }),
    [client]
  );

  const [currentTab, setCurrentTab] = useState<string>(initialTab);
  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  if (loading || !client) return <Loading />;

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    navigate(`${baseRoute}/${newValue}`, { replace: true });
    setCurrentTab(newValue);
  };
  return (
    <>
      <PageHeader>
        <Typography variant='h4'>{HmisUtil.name(client)}</Typography>
      </PageHeader>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={currentTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleChange}
              aria-label='client dashboard tabs'
              indicatorColor='secondary'
              textColor='secondary'
              variant='fullWidth'
            >
              {tabs.map(({ label, path }) => (
                <Tab
                  label={label}
                  key={path}
                  value={path}
                  component={Link}
                  to={`${baseRoute}/${path}`}
                  sx={{
                    textTransform: 'capitalize',
                    fontWeight: currentTab === path ? 'bold' : undefined,
                  }}
                />
              ))}
            </TabList>
          </Box>
          {/* Render inactive tab panels too (as empty divs) for accessibility https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/#wai-aria-roles-states-and-properties-22 */}
          {tabs.map(({ path }) => (
            <TabPanel value={path} key={path}>
              {path === currentTab && (
                <Container maxWidth='xl'>
                  <Outlet context={outletContext} />
                </Container>
              )}
            </TabPanel>
          ))}
        </TabContext>
      </Box>
    </>
  );
};

type ContextType = { client: Client };
export const useDashboardClient = () => useOutletContext<ContextType>();

export default ClientDashboard;
