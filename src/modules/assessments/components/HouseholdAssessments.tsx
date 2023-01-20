import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  AppBar,
  Grid,
  Stack,
  Tab,
  Typography,
  TabProps,
  Alert,
} from '@mui/material';
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

type MemberTabDefinition = {
  name?: string;
  id: string;
  isHoh: boolean;
  enrollmentId: string;
  assessmentId?: string;
};

const MemberTab = ({
  definition,
  sx,
  ...props
}: TabProps & { definition: MemberTabDefinition }) => (
  <Tab
    sx={{ ...sx }}
    {...props}
    label={definition.isHoh ? `(HoH) ${definition.name}` : definition.name}
  />
);

/**
 * TODO: think about how you would "apply changes to all assessments" (would it save or apply locally?)
 */

const HouseholdAssessments = ({ type, title, enrollment }: Props) => {
  // TODO exclude exited if exiting
  // exclude completed intakes if intake-ing
  const [householdMembers, { loading, error }] = useHouseholdMembers(
    enrollment.id,
    type === 'ENTRY' ? 'INCOMPLETE_ENTRY' : 'INCOMPLETE_EXIT'
  );

  console.debug('Household Members', householdMembers);

  const [currentTab, setCurrentTab] = useState<string | undefined>();

  const tabs: MemberTabDefinition[] = useMemo(() => {
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
    // TODO can we know if we have unsaved changes and warn about them?
    event.preventDefault();
    window.scrollTo(0, 0);
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
          <Grid container sx={{ height: '100%', alignItems: 'center' }}>
            <Grid item xs={3}>
              <Stack gap={0.2}>
                {title}
                {enrollment && (
                  <Typography variant='body1'>
                    {enrollmentName(enrollment)}
                  </Typography>
                )}
              </Stack>
            </Grid>
            <Grid item xs={1} sm={0.1}></Grid>
            <Grid item xs={8} sx={{ height: '100%' }}>
              <TabList
                onChange={handleChangeTab}
                aria-label='household member tabs'
                sx={{
                  '&.MuiTabs-root': { height: '100%' },
                  '.MuiTabs-flexContainer': { height: '100%' },
                }}
              >
                {tabs.map((definition) => (
                  <MemberTab
                    value={definition.id}
                    key={definition.id}
                    definition={definition}
                    sx={{
                      justifyContent: 'end',
                      fontWeight: 800,
                      pb: 2,
                      px: 4,
                    }}
                  />
                ))}
              </TabList>
            </Grid>
          </Grid>
        </AppBar>
        <Grid container spacing={4} sx={{ py: 2 }}>
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
            {tabs.length === 0 && (
              <Alert severity='info'>
                No household members can be{' '}
                {type === 'ENTRY' ? 'entered' : 'exited'} at this time
              </Alert>
            )}
          </Grid>
        </Grid>
      </TabContext>
    </>
  );
};
export default HouseholdAssessments;
