import { Alert, AlertTitle, Box, Grid, Typography } from '@mui/material';
import { keyBy, mapValues, startCase } from 'lodash-es';
import pluralize from 'pluralize';
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { assessmentPrefix } from '../../util';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import HouseholdSummaryTable from './HouseholdSummaryTable';
import {
  HouseholdAssesmentRole,
  TabDefinition,
  tabPanelA11yProps,
} from './util';

import BackButtonLink from '@/components/elements/BackButtonLink';
import LoadingButton from '@/components/elements/LoadingButton';
import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import TitleCard from '@/components/elements/TitleCard';
import useSafeParams from '@/hooks/useSafeParams';
import HouseholdSummaryExitHelpCard from '@/modules/assessments/components/household/HouseholdSummaryExitHelpCard';
import HouseholdSummaryIntakeHelpCard from '@/modules/assessments/components/household/HouseholdSummaryIntakeHelpCard';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ValidationErrorList from '@/modules/errors/components/ValidationErrorList';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { cache } from '@/providers/apolloClient';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  SubmitHouseholdAssessmentsMutation,
  useSubmitHouseholdAssessmentsMutation,
  VersionedRecordInput,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface HouseholdSummaryTabPanelProps {
  active: boolean;
  role: HouseholdAssesmentRole;
  tabs: TabDefinition[];
  id: string;
  projectName: string;
  refetch: () => Promise<any>;
  setCurrentTab: Dispatch<SetStateAction<string | undefined>>;
  blocked: boolean;
}

// Memoized to only re-render when props change (shallow compare)
const HouseholdSummaryTabPanel = memo(
  ({
    role,
    active,
    id,
    tabs,
    projectName,
    refetch,
    setCurrentTab,
    blocked,
  }: HouseholdSummaryTabPanelProps) => {
    const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);
    const [submitMutation, { loading, data: submitResponseData }] =
      useSubmitHouseholdAssessmentsMutation({
        onError: (apolloError) =>
          setErrors({ ...emptyErrorState, apolloError }),
      });

    const allSubmitted = useMemo(
      () => !tabs.find((t) => !t.assessmentSubmitted),
      [tabs]
    );

    const [assessmentsToSubmit, setAssessmentsToSubmit] = useState<string[]>(
      []
    );

    const onCompleted = useCallback(
      ({ submitHouseholdAssessments }: SubmitHouseholdAssessmentsMutation) => {
        if (!submitHouseholdAssessments) return;
        if (submitHouseholdAssessments.errors.length > 0) {
          setErrors(partitionValidations(submitHouseholdAssessments.errors));
          window.scrollTo(0, 0);
        } else if (submitHouseholdAssessments.assessments) {
          setErrors(emptyErrorState);
          refetch();

          tabs.forEach(({ clientId, enrollmentId }) => {
            // Make it so the "Assessments" table on the Enrollment page gets refetched next time
            cache.evict({
              id: `Enrollment:${enrollmentId}`,
              // fieldName: 'assessments',
            });
            // Make it so the "Assessments" table on the Client page gets refetched next time
            cache.evict({
              id: `Client:${clientId}`,
              fieldName: 'assessments',
            });
          });
        }
      },
      [refetch, tabs]
    );

    const handleSubmit = useCallback(
      (confirmed: boolean) => {
        const submissions = tabs
          .map(
            ({
              assessmentId,
              assessmentLockVersion,
            }): VersionedRecordInput | undefined => {
              if (assessmentId && assessmentsToSubmit.includes(assessmentId)) {
                return {
                  id: assessmentId,
                  lockVersion: assessmentLockVersion,
                };
              }
              return undefined;
            }
          )
          .filter((i): i is VersionedRecordInput => !!i);

        setErrors(emptyErrorState);
        submitMutation({
          variables: {
            input: {
              submissions,
              confirmed,
            },
          },
          onCompleted,
        });
      },
      [submitMutation, onCompleted, assessmentsToSubmit, tabs]
    );

    const { renderValidationDialog } = useValidationDialog({ errorState });

    const { clientId, enrollmentId } = useSafeParams() as {
      clientId: string;
      enrollmentId: string;
    };
    const enrollmentPath = generateSafePath(
      EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
      {
        clientId,
        enrollmentId,
      }
    );

    return (
      <AlwaysMountedTabPanel
        active={active}
        key='summary'
        {...tabPanelA11yProps(id)}
      >
        <Grid
          container
          justifyContent='center'
          alignItems='center'
          sx={{ py: 2 }}
        >
          <Grid item xs={12} md={10} lg={8}>
            <Typography variant='h4' sx={{ mb: 2 }}>
              Complete {assessmentPrefix(role)} {projectName}
            </Typography>
            {role === AssessmentRole.Exit && (
              <HouseholdSummaryExitHelpCard tabs={tabs} />
            )}
            {role === AssessmentRole.Intake && (
              <HouseholdSummaryIntakeHelpCard tabs={tabs} />
            )}
            <ApolloErrorAlert error={errorState.apolloError} />
            {errorState.errors.length > 0 && (
              <Grid item>
                <Alert
                  severity='error'
                  sx={{ mb: 3 }}
                  data-testid='formErrorAlert'
                >
                  <AlertTitle>Failed to submit</AlertTitle>
                  <ValidationErrorList errors={errorState.errors} />
                </Alert>
              </Grid>
            )}
            <TitleCard title='Select Household Members for Submission'>
              {blocked ? (
                <LoadingSkeleton px={2} count={tabs.length} />
              ) : (
                <HouseholdSummaryTable
                  tabs={tabs}
                  role={role}
                  setAssessmentsToSubmit={setAssessmentsToSubmit}
                  setCurrentTab={setCurrentTab}
                />
              )}
              <Box sx={{ px: 2, py: 3 }}>
                <LoadingButton
                  loading={loading}
                  onClick={() => handleSubmit(false)}
                  disabled={assessmentsToSubmit.length === 0 || blocked}
                >
                  {`Submit (${assessmentsToSubmit.length}) ${startCase(
                    role.toLowerCase()
                  )}`}{' '}
                  {pluralize('Assessment', assessmentsToSubmit.length)}
                </LoadingButton>
              </Box>
            </TitleCard>
            {(submitResponseData?.submitHouseholdAssessments?.assessments ||
              allSubmitted) && (
              <BackButtonLink sx={{ my: 4 }} to={enrollmentPath}>
                Back to Enrollment
              </BackButtonLink>
            )}
          </Grid>
        </Grid>
        {renderValidationDialog({
          onConfirm: () => handleSubmit(true),
          loading: loading,
          sectionLabels: mapValues(keyBy(tabs, 'assessmentId'), 'clientName'),
        })}
      </AlwaysMountedTabPanel>
    );
  }
);

HouseholdSummaryTabPanel.displayName = 'HouseholdSummaryTabPanel';

export default HouseholdSummaryTabPanel;
