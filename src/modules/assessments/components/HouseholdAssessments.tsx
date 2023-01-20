import { TabContext, TabList, TabPanel } from '@mui/lab';
import { AppBar, Grid, Stack, Tab, Typography } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';

import IndividualAssessment from './IndividualAssessment';

import Loading from '@/components/elements/Loading';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { clientBriefName, enrollmentName } from '@/modules/hmis/hmisUtil';
import { useHouseholdMembers } from '@/modules/household/components/useHouseholdMembers';
import {
  AssessmentRole,
  EnrollmentFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  type: 'ENTRY' | 'EXIT';
  title: ReactNode;
}

export const HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT = 72;

/**
 * TODO: think about how you would "apply changes to all assessments" (would it save or apply locally?)
 */

const HouseholdAssessments = ({ type, title, enrollment }: Props) => {
  const [householdMembers, { loading, error }] = useHouseholdMembers(
    enrollment.id
  );

  const [currentTab, setCurrentTab] = useState<string | undefined>();

  const tabs = useMemo(() => {
    const tabs = householdMembers.map((hc) => ({
      name: clientBriefName(hc.client),
      id: hc.client.id,
      isHoh: hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold,
      enrollmentId: hc.enrollment.id,
      assessmentId:
        type === 'ENTRY'
          ? hc.enrollment.intakeAssessment?.id
          : hc.enrollment.exitAssessment?.id,
    }));
    if (tabs.length > 0) setCurrentTab(tabs[0].id);
    return tabs;
  }, [householdMembers, type]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    setCurrentTab(newValue);
  };

  if (loading) return <Loading />;
  if (error) throw error;

  // difference is that we don't have the assessment ID
  // fetch here for all
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
            height: HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT,
            alignItems: 'stretch',
            justifyContent: 'center',
            top: STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
            backgroundColor: 'white',
            borderBottomWidth: '1px',
            borderBottomColor: 'borders.light',
            borderBottomStyle: 'solid',
            px: { sm: 3, lg: 5 },
            ml: { xs: -2, sm: -3, lg: -4 },
            mt: { xs: -1, sm: -2 },
            // Has same scrollbar gutter issue
            width: '100vw',
          }}
        >
          <Stack gap={2} direction='row'>
            <Stack gap={1} sx={{ mr: 10, pb: 2 }}>
              {title}
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
            {tabs.map(({ id, name, enrollmentId, assessmentId }) => (
              <TabPanel value={id} key={id} sx={{ py: 0 }}>
                <IndividualAssessment
                  clientName={name}
                  embeddedInWorkflow
                  enrollmentId={enrollmentId}
                  assessmentId={assessmentId}
                  assessmentRole={
                    type === 'ENTRY'
                      ? AssessmentRole.Intake
                      : AssessmentRole.Exit
                  }
                />
              </TabPanel>
            ))}
          </Grid>
        </Grid>
      </TabContext>
    </>
  );
};
export default HouseholdAssessments;
