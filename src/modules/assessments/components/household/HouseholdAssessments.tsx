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
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useHouseholdAssessments } from '../../hooks/useHouseholdAssessments';

import HouseholdAssessmentTabPanel from './HouseholdAssessmentTabPanel';
import HouseholdSummaryTabPanel from './HouseholdSummaryTabPanel';
import TabLabel, { SummaryTabLabel } from './TabLabel';
import {
  AssessmentStatus,
  HouseholdAssesmentRole,
  householdAssesmentTitle,
  SUMMARY_TAB_ID,
  tabA11yProps,
  TabDefinition,
} from './util';

import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import useHasRefetched from '@/hooks/useHasRefetched';
import {
  HouseholdAssessmentFormAction,
  HouseholdAssessmentFormState,
  householdAssessmentFormStateReducer,
  initialHouseholdAssessmentFormState,
} from '@/modules/assessments/components/household/formState';
import { clientBriefName, enrollmentName } from '@/modules/hmis/hmisUtil';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import { router } from '@/routes/router';
import {
  AssessmentFieldsFragment,
  AssessmentRole,
  EnrollmentFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  role: HouseholdAssesmentRole;
  assessmentId?: string;
}

const calculateAssessmentStatus = (
  assessment: AssessmentFieldsFragment | undefined
): AssessmentStatus => {
  if (!assessment) {
    return AssessmentStatus.NotStarted;
  }
  if (assessment.inProgress) {
    return AssessmentStatus.Started;
  } else {
    return AssessmentStatus.Submitted;
  }
};

const HouseholdAssessments: React.FC<Props> = ({
  role,
  enrollment,
  assessmentId,
}) => {
  // track if there are any dirty assessment forms
  const [formStates, setFormStates] = useState<
    Record<string, HouseholdAssessmentFormState>
  >({});
  const handleFormStateChange = useCallback(
    (enrollmentId: string, action: HouseholdAssessmentFormAction) => {
      setFormStates((cur) => {
        const state = cur[enrollmentId] || initialHouseholdAssessmentFormState;
        return {
          ...cur,
          [enrollmentId]: householdAssessmentFormStateReducer(state, action),
        };
      });
    },
    []
  );
  const hasDirtyAssessments = Object.values(formStates).some(
    ({ dirty }) => dirty
  );
  const hasInflights = Object.values(formStates).some(({ saving }) => saving);

  const [householdMembers, fetchMembersStatus] = useHouseholdMembers(
    enrollment.id
  );

  const { assessmentByEnrollmentId, refetch, ...fetchAssessmentsStatus } =
    useHouseholdAssessments({
      role,
      householdId: enrollment.householdId,
      assessmentId,
    });
  const [currentTab, setCurrentTab] = useState<string | undefined>('1');
  const [nextTab, setNextTab] = useState<string>();

  const [tabs, setTabs] = useState<TabDefinition[]>([]);

  const hasRefetched = useHasRefetched(fetchAssessmentsStatus.networkStatus);

  useEffect(() => {
    if (!householdMembers) return;
    if (!assessmentByEnrollmentId) return;
    setTabs((oldTabs) => {
      const newTabs: TabDefinition[] = householdMembers.map(
        ({ client, enrollment, relationshipToHoH }, index) => {
          const assessment = assessmentByEnrollmentId[enrollment.id];
          const assessmentId = assessment?.id;
          const assessmentInProgress = assessment?.inProgress;
          const assessmentDate = assessment?.assessmentDate;

          // Whether the actual Entry/Exit has been completed (notwithstanding assessment status)
          const entryOrExitCompleted =
            role === AssessmentRole.Intake
              ? !enrollment.inProgress
              : role === AssessmentRole.Exit
              ? !!enrollment.exitDate
              : undefined;

          const status = calculateAssessmentStatus(assessment);
          const tabData: TabDefinition = {
            clientName: clientBriefName(client),
            id: (index + 1).toString(),
            isHoh: relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold,
            enrollmentId: enrollment.id,
            entryDate: enrollment.entryDate,
            exitDate: enrollment.exitDate || undefined,
            enrollmentInProgress: enrollment.inProgress,
            entryOrExitCompleted,
            assessmentId,
            assessmentLockVersion: assessment?.lockVersion,
            assessmentInProgress,
            assessmentSubmitted: !!assessmentId && !assessmentInProgress,
            clientId: client.id,
            client: {
              id: client.id,
              dob: client.dob,
              veteranStatus: client.veteranStatus,
            },
            relationshipToHoH,
            assessmentDate,
            status: status,
          };

          // If membership hasn't changed, make sure we keep the "local" state parts if present
          if (
            oldTabs.length === householdMembers.length &&
            oldTabs[index] &&
            status !== AssessmentStatus.Submitted
          ) {
            tabData.status = oldTabs[index].status;
          }

          return tabData;
        }
      );
      return newTabs;
    });
  }, [householdMembers, assessmentByEnrollmentId, role]);

  const { hash } = useLocation();

  useEffect(() => {
    if (hasRefetched) return;
    const hashString = hash.replace('#', '');
    const hashNum = hashString ? parseInt(hashString) : -1;
    const isValid =
      hashString === 'summary' ||
      (isFinite(hashNum) && hashNum >= 0 && hashNum <= tabs.length);

    if (isValid) {
      setCurrentTab(hashString);
    } else {
      setCurrentTab('1');
    }
  }, [hasRefetched, hash, tabs.length]);

  const { pathname } = useLocation();

  const navigateToTab = useCallback((newValue: string) => {
    setNextTab(newValue);
  }, []);

  useEffect(() => {
    if (hasDirtyAssessments) return;
    if (hasInflights) return;
    if (!nextTab) return;
    if (nextTab === currentTab) return;
    // TODO: cancel navigation if errors
    setCurrentTab(nextTab);
    setNextTab(undefined);
    window.scrollTo(0, 0);
    router.navigate(`${pathname}#${nextTab}`, { replace: true });
    // console.info('navigating')
  }, [pathname, nextTab, currentTab, hasDirtyAssessments, hasInflights]);

  // console.info({hasDirtyAssessments, hasInflights, nextTab, currentTab});
  // console.info(formStates);

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

  if (
    (!householdMembers && fetchMembersStatus.loading) ||
    (!assessmentByEnrollmentId && fetchAssessmentsStatus.loading)
  ) {
    return <Loading />;
  }

  if (fetchMembersStatus.error) throw fetchMembersStatus.error;
  if (fetchAssessmentsStatus.error) throw fetchAssessmentsStatus.error;

  const tabSx = {
    minWidth: '140px',
    px: 4,
  };

  return (
    <>
      <AppBar
        position='sticky'
        color='default'
        variant='elevation'
        elevation={2}
        sx={{
          height: HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT,
          alignItems: 'stretch',
          justifyContent: 'center',
          top: STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
          backgroundColor: 'white',
          px: { sm: 3, lg: 5 },
          ml: { xs: -2, sm: -3, lg: -4 },
          mt: { xs: -1, sm: -2 },
          // Has same scrollbar gutter issue
          width: '100vw',
        }}
      >
        <Grid
          container
          sx={{
            height: '100%',
          }}
        >
          <Grid
            item
            xs={2}
            sx={({ shadows }) => ({
              height: '100%',
              boxShadow: shadows[2],
              clipPath: 'inset(0px -15px 0px 0px)',
              display: 'flex',
              alignItems: 'flex-end',
              pt: 1,
              pb: 2,
            })}
          >
            <Stack gap={0.2} sx={{ overflow: 'hidden' }}>
              <Typography variant='body2' fontWeight={600}>
                {householdAssesmentTitle(role)}
              </Typography>
              {enrollment && (
                <Typography
                  variant='body2'
                  sx={{
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    paddingRight: 2,
                  }}
                >
                  {enrollmentName(enrollment)}
                </Typography>
              )}
            </Stack>
          </Grid>
          {/* <Grid item xs={1} sm={0.1}></Grid> */}
          <Grid
            item
            xs={8}
            sx={{
              height: '100%',
              pr: 6,
              display: 'flex',
              alignItems: 'flex-end',
              // Dont show icon color for not-currently-active tabs
              '.MuiTab-root[aria-selected="false"] svg': {
                color: 'text.disabled',
              },
            }}
          >
            <Tabs
              value={currentTab === SUMMARY_TAB_ID ? false : currentTab}
              onChange={handleChangeTab}
              aria-label='household member tabs'
              variant='scrollable'
              scrollButtons='auto'
              TabIndicatorProps={{ style: { height: '4px' } }}
            >
              {tabs.map((definition) => (
                <Tab
                  value={definition.id}
                  key={definition.id}
                  label={<TabLabel definition={definition} />}
                  sx={tabSx}
                  {...tabA11yProps(definition.id)}
                />
              ))}
            </Tabs>
          </Grid>
          <Grid
            item
            xs={2}
            sx={({ shadows }) => ({
              height: '100%',
              boxShadow: shadows[2],
              clipPath: 'inset(0px 0px 0px -15px)',
              display: 'flex',
              alignItems: 'flex-end',
            })}
          >
            <Tabs
              value={currentTab === SUMMARY_TAB_ID ? currentTab : false}
              onChange={handleChangeTab}
              aria-label='review and submit tab'
              scrollButtons={false}
              TabIndicatorProps={{ style: { height: '4px' } }}
            >
              <Tab
                value={SUMMARY_TAB_ID}
                key={SUMMARY_TAB_ID}
                label={<SummaryTabLabel role={role} />}
                sx={{
                  ...tabSx,
                  // justifyContent: 'left',
                  pb: 3,
                  alignItems: 'flex-start',
                }}
                onClick={() => navigateToTab('summary')}
                {...tabA11yProps(SUMMARY_TAB_ID)}
              />
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
              navigatingAway={
                !!(
                  tabDefinition.id === currentTab &&
                  nextTab &&
                  nextTab !== currentTab
                )
              }
              refetch={refetch}
              navigateToTab={navigateToTab}
              nextTab={tabs[index + 1]?.id || SUMMARY_TAB_ID}
              previousTab={tabs[index - 1]?.id}
              role={role}
              updateTabStatus={updateTabStatus}
              assessmentStatus={tabDefinition.status}
              onFormStateChange={handleFormStateChange}
              formState={
                formStates[tabDefinition.enrollmentId] ||
                initialHouseholdAssessmentFormState
              }
              {...tabDefinition}
            />
          ))}
          {tabs.length === 0 &&
          !fetchAssessmentsStatus.loading &&
          !fetchMembersStatus.loading ? (
            <Alert severity='info'>
              {role === AssessmentRole.Intake ? (
                <>No household members can be entered at this time</>
              ) : role === AssessmentRole.Exit ? (
                <>No household members can be exited at this time</>
              ) : (
                <>No assessments to perform</>
              )}
            </Alert>
          ) : (
            tabs.length > 0 && (
              <HouseholdSummaryTabPanel
                key={SUMMARY_TAB_ID}
                id={SUMMARY_TAB_ID}
                tabs={tabs}
                active={SUMMARY_TAB_ID === currentTab}
                role={role}
                projectName={enrollmentName(enrollment)}
                refetch={refetch}
                setCurrentTab={setCurrentTab}
                blocked={hasDirtyAssessments}
              />
            )
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default HouseholdAssessments;
