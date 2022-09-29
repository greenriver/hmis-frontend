import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Container, Stack, Tab, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  generatePath,
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { Client, useGetClientQuery } from '@/types/gqlTypes';

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

  const {
    data: { client } = {},
    loading,
    error,
  } = useGetClientQuery({
    variables: { id: params.clientId },
  });
  if (error) throw error;

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

  if (loading) return <Loading />;
  if (!client) throw Error('Client not found');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    navigate(generatePath(newValue, params), { replace: true });
    setCurrentTab(newValue);
  };

  return (
    <>
      <PageHeader>
        <Stack spacing={2} direction='row' justifyContent='space-between'>
          <Typography variant='h4'>{HmisUtil.clientName(client)}</Typography>
          {import.meta.env.PUBLIC_WAREHOUSE_URL && (
            <Button
              variant='text'
              size='small'
              href={`${import.meta.env.PUBLIC_WAREHOUSE_URL}clients/${
                client.id
              }/from_source`}
              target='_blank'
              endIcon={
                <OpenInNewIcon
                  fontSize='small'
                  sx={{ '&.MuiSvgIcon-fontSizeSmall': { fontSize: '16px' } }}
                />
              }
            >
              View in Warehouse
            </Button>
          )}
        </Stack>
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
                  component={RouterLink}
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
