import {
  Alert,
  AppBar,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { memo, ReactNode, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import IndividualAssessment from '../IndividualAssessment';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import TabLabel from './TabLabel';

import Loading from '@/components/elements/Loading';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { ClientNameDobVeteranFields } from '@/modules/form/util/formUtil';
import { clientBriefName, enrollmentName } from '@/modules/hmis/hmisUtil';
import { useHouseholdMembers } from '@/modules/household/components/useHouseholdMembers';
import { router } from '@/routes/router';
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

const tabA11yProps = (key: string) => {
  return {
    id: `tab-${key}`,
    'aria-controls': `tabpanel-${key}`,
  };
};

const tabPanelA11yProps = (key: string) => {
  return {
    id: `tabpanel-${key}`,
    'aria-labelledby': `tab-${key}`,
  };
};

export type AssessmentStatus = 'not-started' | 'started' | 'submitted';

type TabDefinition = {
  id: string;
  clientName: string;
  client: ClientNameDobVeteranFields;
  enrollmentId: string;
  assessmentId?: string;
  assessmentInProgress?: boolean;
  isHoh: boolean;
  relationshipToHoH: RelationshipToHoH;
};

interface HouseholdAssessmentTabPanelProps extends TabDefinition {
  active: boolean;
  assessmentRole: AssessmentRole.Intake | AssessmentRole.Exit;
  onSuccess: VoidFunction;
}

// const shallowCompareIgnoreFunctions = (obj1, obj2) =>
//   Object.keys(obj1).length === Object.keys(obj2).length &&
//   Object.keys(obj1).every(
//     (key) => typeof obj1[key] === 'function' || obj1[key] === obj2[key]
//   );

// Memoized to only re-render when props change (shallow compare)
const HouseholdAssessmentTabPanel = memo(
  ({
    active,
    id,
    clientName,
    enrollmentId,
    assessmentId,
    client,
    relationshipToHoH,
    assessmentRole,
  }: // onSuccess,
  HouseholdAssessmentTabPanelProps) => {
    console.debug('Rendering assessment panel for', clientName);

    const FormActionProps = useMemo(() => {
      return {
        // TODO gig update all the handlers
        config: [
          {
            label: 'Ready to Exit',
            action: 'SAVE',
            // When read, checkmark and disabled
            // buttonProps: { variant: 'outlined' },
            onSuccess: () => console.log('marking as ready for exit'),
          },
          {
            label: 'Previous',
            action: 'SAVE',
            buttonProps: { variant: 'outlined' },
            onSuccess: () => console.log('going to previous'),
          },
          {
            label: 'Next',
            action: 'SAVE',
            buttonProps: { variant: 'outlined' },
            onSuccess: () => console.log('going to next'),
          },
        ],
      };
    }, []);

    return (
      <AlwaysMountedTabPanel
        active={active}
        key={id}
        {...tabPanelA11yProps(id)}
      >
        <IndividualAssessment
          clientName={clientName}
          client={client}
          relationshipToHoH={relationshipToHoH}
          embeddedInWorkflow
          enrollmentId={enrollmentId}
          assessmentId={assessmentId}
          assessmentRole={assessmentRole}
          FormActionProps={FormActionProps}
        />
      </AlwaysMountedTabPanel>
    );
  }
  // shallowCompareIgnoreFunctions
);

const HouseholdAssessments = ({ type, title, enrollment }: Props) => {
  const [householdMembers, { loading, error, refetch, networkStatus }] =
    useHouseholdMembers(
      enrollment.id
      // type === 'ENTRY' ? 'INCOMPLETE_ENTRY' : 'INCOMPLETE_EXIT'
    );

  const [currentTab, setCurrentTab] = useState<string | undefined>('1');

  const [tabs, setTabs] = useState<TabDefinition[]>([]);

  // const [hasRefetched, setHasRefetched] = useState(false);
  // useEffect(() => {
  //   // See for statuses 2/3/4:  https://github.com/apollographql/apollo-client/blob/d96f4578f89b933c281bb775a39503f6cdb59ee8/src/core/networkStatus.ts#L12-L28
  //   if ([2, 3, 4].includes(networkStatus)) setHasRefetched(true);
  // }, [networkStatus]);

  useEffect(() => {
    const newTabs: TabDefinition[] = householdMembers.map((hc, index) => ({
      clientName: clientBriefName(hc.client),
      id: (index + 1).toString(),
      isHoh: hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold,
      enrollmentId: hc.enrollment.id,
      assessmentId:
        type === 'ENTRY'
          ? hc.enrollment.intakeAssessment?.id
          : hc.enrollment.exitAssessment?.id,
      assessmentInProgress:
        type === 'ENTRY'
          ? !!hc.enrollment.intakeAssessment?.inProgress
          : !!hc.enrollment.exitAssessment?.inProgress,
      client: {
        dob: hc.client.dob,
        veteranStatus: hc.client.veteranStatus,
      },
      relationshipToHoH: hc.relationshipToHoH,
    }));

    setTabs(newTabs);
  }, [householdMembers, type]);

  const { hash } = useLocation();

  useEffect(() => {
    const hashNum = hash ? parseInt(hash.replace('#', '')) : -1;
    const currentHash = isFinite(hashNum) && hashNum >= 0 ? hashNum : undefined;
    if (currentHash && currentHash <= tabs.length) {
      setCurrentTab(String(currentHash));
    }
  }, [hash, tabs]);

  const onSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    event.preventDefault();
    setCurrentTab(newValue);
    window.scrollTo(0, 0);
    router.navigate(`#${newValue}`, { replace: true });
  };

  // const navigateToNext = useCallback(() => {
  //   console.log('next', currentTab, tabs);
  // }, [currentTab, tabs]);

  // const navigateToPrevious = useCallback(() => {
  //   console.log('previous', currentTab, tabs);
  // }, [currentTab, tabs]);

  if (loading && networkStatus === 1) return <Loading />;
  if (error) throw error;

  return (
    <>
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
            <Tabs
              value={currentTab}
              onChange={handleChangeTab}
              aria-label='household member tabs'
              variant='scrollable'
              scrollButtons='auto'
              sx={{
                '&.MuiTabs-root': { height: '100%' },
                '.MuiTabs-flexContainer': { height: '100%' },
                '.MuiTabScrollButton-root': {
                  alignItems: 'end',
                  pb: 2,
                },
              }}
            >
              {tabs.map((definition) => (
                <Tab
                  value={definition.id}
                  key={definition.id}
                  label={
                    <TabLabel
                      name={definition.clientName}
                      isHoh={definition.isHoh}
                      assessmentId={definition.assessmentId}
                      assessmentInProgress={definition.assessmentInProgress}
                    />
                  }
                  {...tabA11yProps(definition.id)}
                  sx={{
                    justifyContent: 'end',
                    fontWeight: 800,
                    pb: 1,
                    px: 4,
                  }}
                />
              ))}
            </Tabs>
          </Grid>
        </Grid>
      </AppBar>
      <Grid container spacing={4} sx={{ py: 2 }}>
        <Grid item xs={12}>
          {tabs.map((tabDefinition) => (
            <HouseholdAssessmentTabPanel
              key={tabDefinition.id}
              active={tabDefinition.id === currentTab}
              onSuccess={onSuccess}
              assessmentRole={
                type === 'ENTRY' ? AssessmentRole.Intake : AssessmentRole.Exit
              }
              {...tabDefinition}
            />
          ))}
          {tabs.length === 0 && (
            <Alert severity='info'>
              No household members can be{' '}
              {type === 'ENTRY' ? 'entered' : 'exited'} at this time
            </Alert>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default HouseholdAssessments;
