import {
  Alert,
  AppBar,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { findIndex } from 'lodash-es';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import HouseholdAssessmentTabPanel from './HouseholdAssessmentTabPanel';
import TabLabel from './TabLabel';

import Loading from '@/components/elements/Loading';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import useHasRefetched from '@/hooks/useHasRefetched';
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

export enum AssessmentStatus {
  NotStarted,
  Started,
  ReadyToSubmit,
  Submitted,
  Warning,
  Error,
}

type LocalTabState = {
  status: AssessmentStatus;
};

export type TabDefinition = {
  id: string;
  clientName: string;
  client: ClientNameDobVeteranFields;
  enrollmentId: string;
  assessmentId?: string;
  assessmentInProgress?: boolean;
  isHoh: boolean;
  relationshipToHoH: RelationshipToHoH;
} & LocalTabState;

const HouseholdAssessments = ({ type, title, enrollment }: Props) => {
  const [householdMembers, { loading, error, refetch, networkStatus }] =
    useHouseholdMembers(
      enrollment.id
      // type === 'ENTRY' ? 'INCOMPLETE_ENTRY' : 'INCOMPLETE_EXIT'
    );

  const [currentTab, setCurrentTab] = useState<string | undefined>('1');

  const [tabs, setTabs] = useState<TabDefinition[]>([]);

  const hasRefetched = useHasRefetched(networkStatus);

  useEffect(() => {
    setTabs((oldTabs) => {
      const newTabs: TabDefinition[] = householdMembers.map(
        ({ client, enrollment, relationshipToHoH }, index) => {
          const assessmentId =
            type === 'ENTRY'
              ? enrollment.intakeAssessment?.id
              : enrollment.exitAssessment?.id;
          const assessmentInProgress =
            type === 'ENTRY'
              ? !!enrollment.intakeAssessment?.inProgress
              : !!enrollment.exitAssessment?.inProgress;

          const tabData: TabDefinition = {
            clientName: clientBriefName(client),
            id: (index + 1).toString(),
            isHoh: relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold,
            enrollmentId: enrollment.id,
            assessmentId,
            assessmentInProgress,
            client: {
              dob: client.dob,
              veteranStatus: client.veteranStatus,
            },
            relationshipToHoH,
            status:
              assessmentId && !assessmentInProgress
                ? AssessmentStatus.Submitted
                : assessmentId
                ? AssessmentStatus.Started
                : AssessmentStatus.NotStarted,
          };

          // If membership hasn't changed, make sure we keep the "local" state parts if present
          if (oldTabs.length === householdMembers.length && oldTabs[index]) {
            tabData.status = oldTabs[index].status;
          }

          return tabData;
        }
      );
      return newTabs;
    });
  }, [householdMembers, type]);

  const { hash } = useLocation();

  useEffect(() => {
    if (hasRefetched) return;

    const hashNum = hash ? parseInt(hash.replace('#', '')) : -1;
    const currentHash = isFinite(hashNum) && hashNum >= 0 ? hashNum : undefined;
    if (currentHash && currentHash <= tabs.length) {
      setCurrentTab(String(currentHash));
    }
  }, [hasRefetched, hash, tabs.length]);

  const { pathname } = useLocation();

  const navigateToTab = useCallback(
    (newValue: string) => {
      setCurrentTab(newValue);
      window.scrollTo(0, 0);
      router.navigate(`${pathname}#${newValue}`, { replace: true });
    },
    [pathname]
  );

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      event.preventDefault();
      navigateToTab(newValue);
    },
    [navigateToTab]
  );

  const updateTabStatus = useCallback(
    (status: AssessmentStatus, id: string) => {
      setTabs((oldTabs) => {
        const cloned = [...oldTabs];
        const idx = findIndex(cloned, { id });
        if (idx === -1) return oldTabs; // bad state
        cloned[idx] = { ...cloned[idx], status };
        return cloned;
      });
    },
    []
  );

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
                  label={<TabLabel definition={definition} />}
                  {...tabA11yProps(definition.id)}
                  sx={{
                    minWidth: '180px',
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
          {tabs.map((tabDefinition, index) => (
            <HouseholdAssessmentTabPanel
              key={tabDefinition.id}
              active={tabDefinition.id === currentTab}
              refetch={refetch}
              navigateToTab={navigateToTab}
              nextTab={tabs[index + 1]?.id}
              previousTab={tabs[index - 1]?.id}
              assessmentRole={
                type === 'ENTRY' ? AssessmentRole.Intake : AssessmentRole.Exit
              }
              updateTabStatus={updateTabStatus}
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
