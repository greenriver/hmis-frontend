import { TabContext, TabPanel } from '@mui/lab';
import {
  Box,
  Divider,
  lighten,
  Stack,
  SxProps,
  Tab,
  Tabs,
  Theme,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import {
  generatePath,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import ClientCardMini from '../elements/ClientCardMini';
import Loading from '../elements/Loading';
import { totalStickyBarHeight } from '../layout/MainLayout';

import { DashboardRoutes } from '@/routes/routes';
import { Client, useGetClientQuery } from '@/types/gqlTypes';

type TabDef = { label: string; path?: string; url?: string };
type TabGroupDef = { label: string; children: TabDef[] };

const navWidth = 256;
const miniCardHeight = 140;

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

  const tabs: TabGroupDef[] = useMemo(
    () => [
      {
        label: 'Client Navigation',
        children: [
          {
            label: 'Overview',
            path: DashboardRoutes.PROFILE,
          },
          {
            label: 'Enrollments',
            path: DashboardRoutes.ALL_ENROLLMENTS,
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
        ],
      },

      {
        label: 'Administrative',
        children: [
          {
            label: 'Audit History',
            path: DashboardRoutes.HISTORY,
          },
          ...(client && import.meta.env.PUBLIC_WAREHOUSE_URL
            ? [
                {
                  label: 'View in Warehouse',
                  path: undefined,
                  url: `${import.meta.env.PUBLIC_WAREHOUSE_URL}clients/${
                    client.id
                  }/from_source`,
                },
              ]
            : []),
        ],
      },
    ],
    [client]
  );

  const flattenedTabs = useMemo(
    () => tabs.map((t) => t.children).flat(),
    [tabs]
  );

  const initialTab = useMemo(() => {
    const matchedRoute = flattenedTabs.find(
      (t) => t.path && pathname.startsWith(generatePath(t.path, params))
    );
    return matchedRoute?.path || (flattenedTabs[0].path as string);
  }, [pathname, flattenedTabs, params]);

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

  if (loading || !flattenedTabs || !tabs) return <Loading />;
  if (!client) throw Error('Client not found');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    console.log(newValue);
    navigate(generatePath(newValue, params), { replace: true });
    setCurrentTab(newValue);
  };

  const tabSx: SxProps<Theme> = {
    alignItems: 'flex-start',
    textTransform: 'capitalize',
    textAlign: 'left',
    '&:hover': {
      backgroundColor: (theme) => lighten(theme.palette.secondary.light, 0.9),
    },
    opacity: 1,
    typography: 'body1',
    color: 'text.primary',
  };

  const activeTabSx: SxProps<Theme> = {
    fontWeight: 600,
    color: (theme) => theme.palette.secondary.dark,
  };

  return (
    <>
      <Box
        sx={{
          typography: 'body1',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <TabContext value={currentTab}>
          <Stack
            sx={{
              width: navWidth,
              borderRight: (theme) => `1px solid ${theme.palette.grey[300]}`,
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            <Box
              sx={{
                py: 2,
                px: 2,
                position: 'sticky',
                height: miniCardHeight,
                top: totalStickyBarHeight,
                zIndex: (theme) => theme.zIndex.appBar,
                borderBottom: (theme) => `1px solid ${theme.palette.grey[300]}`,
              }}
            >
              <ClientCardMini client={client} />
            </Box>
            <Box
              sx={{
                position: 'sticky',
                top: totalStickyBarHeight + miniCardHeight,
                height: '1px',
              }}
            >
              <Box
                sx={{
                  overflowY: 'auto',
                  height: `calc(100vh - ${
                    totalStickyBarHeight + miniCardHeight
                  }px)`,
                  width: navWidth,
                  backgroundColor: (theme) => theme.palette.background.paper,
                  borderRight: (theme) =>
                    `1px solid ${theme.palette.grey[300]}`,
                }}
              >
                <Tabs
                  onChange={handleChange}
                  aria-label='client dashboard tabs'
                  orientation='vertical'
                >
                  {tabs.map(({ label, children }, idx) => {
                    return (
                      <>
                        <Typography variant='h6' sx={{ pl: 2, mt: 2, mb: 1 }}>
                          {label}
                        </Typography>
                        {children.map(({ label, path, url }) =>
                          path ? (
                            <Tab
                              label={label}
                              key={path}
                              value={path}
                              component={Link}
                              to={generatePath(path, params)}
                              tabIndex={0}
                              sx={{
                                ...tabSx,
                                ...(currentTab === path
                                  ? activeTabSx
                                  : undefined),
                              }}
                            />
                          ) : (
                            <Tab
                              label={label}
                              key={label}
                              component={'a'}
                              href={url}
                              sx={{
                                ...tabSx,
                                ...(currentTab === path
                                  ? activeTabSx
                                  : undefined),
                              }}
                            />
                          )
                        )}
                        {idx < tabs.length - 1 && <Divider sx={{ my: 1 }} />}
                      </>
                    );
                  })}
                </Tabs>
              </Box>
            </Box>
          </Stack>

          {/* Render inactive tab panels too (as empty divs) for accessibility https://www.w3.org/WAI/ARIA/apg/patterns/tabpanel/#wai-aria-roles-states-and-properties-22 */}
          {flattenedTabs.map(({ path }) =>
            path ? (
              <TabPanel value={path} key={path} sx={{ width: '100%' }}>
                {path === currentTab && (
                  // <Container maxWidth='xl' sx={{ border: '1px solid green' }}>
                  <Outlet context={outletContext} />
                  // </Container>
                )}
              </TabPanel>
            ) : null
          )}
        </TabContext>
      </Box>
    </>
  );
};

type ContextType = { client: Client };
export const useDashboardClient = () => useOutletContext<ContextType>();

export default ClientDashboard;
