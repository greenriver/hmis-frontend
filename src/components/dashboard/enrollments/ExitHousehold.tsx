import { TabContext, TabList, TabPanel } from '@mui/lab';
import { AppBar, Grid, Stack, Tab, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import { clientBriefName, enrollmentName } from '@/modules/hmis/hmisUtil';
import { useHouseholdMembers } from '@/modules/household/components/useHouseholdMembers';
import { RelationshipToHoH } from '@/types/gqlTypes';

const EditHousehold = () => {
  const { enrollment } = useOutletContext<DashboardContext>();
  const { enrollmentId } = useParams() as {
    enrollmentId: string;
  };
  const [householdMembers, { loading, error }] =
    useHouseholdMembers(enrollmentId);

  const [currentTab, setCurrentTab] = useState<string | undefined>();

  const tabs = useMemo(() => {
    const tabs = householdMembers.map((hc) => ({
      name: clientBriefName(hc.client),
      id: hc.client.id,
      isHoh: hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold,
    }));
    if (tabs.length > 0) setCurrentTab(tabs[0].id);
    return tabs;
  }, [householdMembers]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    setCurrentTab(newValue);
  };

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <>
      <TabContext value={currentTab || ''}>
        <AppBar
          position='sticky'
          color='default'
          elevation={0}
          sx={{
            borderTop: 'unset',
            borderLeft: 'unset',
            // height: CONTEXT_HEADER_HEIGHT,
            alignItems: 'stretch',
            justifyContent: 'center',
            top: STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
            backgroundColor: 'white',
            borderBottomWidth: '1px',
            borderBottomColor: 'borders.light',
            borderBottomStyle: 'solid',
            pt: 2,
            px: { sm: 3, lg: 5 },
            ml: { xs: -2, sm: -3, lg: -4 },
            mt: { xs: -1, sm: -2 },
            // Has same scrollbar issue
            width: '100vw',
          }}
        >
          <Stack gap={2} direction='row'>
            <Stack gap={1} sx={{ mr: 10, pb: 2 }}>
              <Typography variant='body1' fontWeight={600}>
                Exit Household from Enrollment
              </Typography>
              {enrollment && (
                <Typography variant='body1'>
                  {enrollmentName(enrollment)}
                </Typography>
              )}
            </Stack>
            <TabList
              onChange={handleChangeTab}
              aria-label='household member tabs'
              sx={{ '.MuiTabs-flexContainer': { height: '100%' } }}
            >
              {tabs.map((t) => (
                <Tab
                  key={t.id}
                  label={t.isHoh ? `(HoH) ${t.name}` : t.name}
                  value={t.id}
                  sx={{ justifyContent: 'end', pb: 2, px: 4 }}
                />
              ))}
            </TabList>
          </Stack>
        </AppBar>
        <Grid container spacing={4} sx={{ py: 3 }}>
          <Grid item xs={12}>
            {tabs.map(({ id, name }) => (
              <TabPanel value={id} key={id}>
                <Typography>Exiting {name}...</Typography>
              </TabPanel>
            ))}
          </Grid>
        </Grid>
      </TabContext>
    </>
  );
};
export default EditHousehold;
