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
  generatePath,
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

const ClientDashboard: React.FC = () => {
  const params = useParams() as { clientId: string };
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [client, loading] = useClient(params.clientId);

  const initialTab = useMemo(() => {
    const matchedRoute = tabs.find(({ path }) =>
      pathname.startsWith(generatePath(path, params))
    );
    return matchedRoute?.path || tabs[0].path;
  }, [pathname, params]);

  const [currentTab, setCurrentTab] = useState<string>(initialTab);

  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  const outletContext = useMemo(
    () => ({
      client,
    }),
    [client]
  );

  if (loading || !client) return <Loading />;

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    navigate(generatePath(newValue, params), { replace: true });
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
                  to={generatePath(path, params)}
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
