import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Container, Tab, Typography } from '@mui/material';
import { useState } from 'react';
import {
  Link,
  Outlet,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import Loading from '../elements/Loading';
import PageHeader from '../layout/PageHeader';

import useClient from '@/hooks/useClient';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { Client } from '@/types/gqlTypes';

const tabs = [
  {
    label: 'Profile',
    path: 'profile',
  },
  {
    label: 'Enrollments',
    path: 'enrollments',
  },
  {
    label: 'History',
    path: 'history',
  },
  {
    label: 'Assessments',
    path: 'assessments',
  },
  {
    label: 'Notes',
    path: 'notes',
  },
  {
    label: 'Files',
    path: 'files',
  },
  {
    label: 'Contact',
    path: 'contact',
  },
  {
    label: 'Locations',
    path: 'locations',
  },
  {
    label: 'Referrals',
    path: 'referrals',
  },
];

const ClientDashboard: React.FC = () => {
  const { clientId } = useParams() as { clientId: string };
  const [client, loading] = useClient(clientId);

  const navigate = useNavigate();
  let initial = tabs[0].path;
  const baseRoute = `/client/${clientId}`;
  // TODO need to propogate sub-path like /client/1/enrollments/2
  if (location.pathname) {
    const curr = location.pathname.replace(baseRoute, '').replace('/', '');
    if (curr && tabs.find(({ path }) => path === curr)) {
      initial = curr;
    }
  }
  const [currentTab, setCurrentTab] = useState<string>(initial);

  if (loading || !client) return <Loading />;

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    navigate(`${baseRoute}/${newValue}`, { replace: true });
    setCurrentTab(newValue);
  };
  return (
    <>
      <PageHeader>
        <Typography variant='h5'>{HmisUtil.name(client)}</Typography>
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
                  <Outlet context={{ client }} />
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
