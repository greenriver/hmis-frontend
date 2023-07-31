import {
  Alert,
  AlertTitle,
  Box,
  CheckboxProps,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import {
  fromPairs,
  isNil,
  keyBy,
  mapValues,
  pickBy,
  startCase,
} from 'lodash-es';
import pluralize from 'pluralize';
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { assessmentPrefix } from '../../util';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import HouseholdSummaryTable from './HouseholdSummaryTable';
import {
  AssessmentStatus,
  HouseholdAssesmentRole,
  TabDefinition,
  tabPanelA11yProps,
} from './util';

import LoadingButton from '@/components/elements/LoadingButton';
import RouterLink from '@/components/elements/RouterLink';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ValidationErrorList from '@/modules/errors/components/ValidationErrorList';
import { useValidationDialog } from '@/modules/errors/hooks/useValidationDialog';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { cache } from '@/providers/apolloClient';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  SubmitHouseholdAssessmentsMutation,
  useSubmitHouseholdAssessmentsMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface HouseholdSummaryTabPanelProps {
  active: boolean;
  role: HouseholdAssesmentRole;
  tabs: TabDefinition[];
  id: string;
  projectName: string;
  refetch: () => Promise<any>;
  setCurrentTab: Dispatch<SetStateAction<string | undefined>>;
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
  }: HouseholdSummaryTabPanelProps) => {
    console.debug('Rendering summary panel');

    const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
      fromPairs(
        tabs
          .filter((t) => !!t.assessmentId)
          .map((t) => [
            t.assessmentId,
            t.status === AssessmentStatus.ReadyToSubmit,
          ])
      )
    );

    useEffect(() => {
      if (!active) setCheckedState({});
    }, [active]);

    const onClickCheckbox: (
      ...assessmentIds: string[]
    ) => CheckboxProps['onChange'] = useCallback(
      (...assessmentIds: string[]) =>
        (_event, checked) => {
          if (!assessmentIds.length) return;
          setCheckedState((old) => {
            const copy = { ...old };
            assessmentIds.forEach((id) => {
              if (!isNil(id)) copy[id] = checked;
            });
            return copy;
          });
        },
      []
    );

    const [errorState, setErrors] = useState<ErrorState>(emptyErrorState);

    const [submitMutation, { loading }] = useSubmitHouseholdAssessmentsMutation(
      {
        onError: (apolloError) =>
          setErrors({ ...emptyErrorState, apolloError }),
      }
    );

    const assessmentsToSubmit = useMemo(
      () => Object.keys(pickBy(checkedState)),
      [checkedState]
    );

    const onCompleted = useCallback(
      ({ submitHouseholdAssessments }: SubmitHouseholdAssessmentsMutation) => {
        if (!submitHouseholdAssessments) return;
        if (submitHouseholdAssessments.errors.length > 0) {
          setErrors(partitionValidations(submitHouseholdAssessments.errors));
          window.scrollTo(0, 0);
        } else if (submitHouseholdAssessments.assessments) {
          setErrors(emptyErrorState);
          setCheckedState({});
          refetch();

          tabs.forEach(({ clientId, enrollmentId }) => {
            // Make it so the "Assessments" table on the Enrollment page gets refetched next time
            cache.evict({
              id: `Enrollment:${enrollmentId}`,
              fieldName: 'assessments',
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
        submitMutation({
          variables: {
            input: { assessmentIds: assessmentsToSubmit, confirmed },
          },
          onCompleted,
        });
      },
      [submitMutation, onCompleted, assessmentsToSubmit]
    );

    const { renderValidationDialog } = useValidationDialog({ errorState });

    const [hohClientId, hohEnrollmentId] = useMemo(() => {
      const tab = tabs.find(({ isHoh }) => isHoh);
      return [tab?.clientId, tab?.enrollmentId];
    }, [tabs]);

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
            <Typography variant='h4' sx={{ mb: 3 }}>
              Complete {assessmentPrefix(role)} {projectName}
            </Typography>
            {role === AssessmentRole.Exit && hohEnrollmentId && hohClientId && (
              <Typography sx={{ mb: 3 }}>
                Select members to exit. The Head of Household cannot be exited
                before other members. In order to exit the HoH, you must either
                exit all members or{' '}
                <RouterLink
                  to={generateSafePath(ClientDashboardRoutes.EDIT_HOUSEHOLD, {
                    clientId: hohClientId,
                    enrollmentId: hohEnrollmentId,
                  })}
                  variant='body1'
                >
                  change the Head of Household
                </RouterLink>
                .
              </Typography>
            )}
            {errorState.apolloError && (
              <Box sx={{ mb: 3 }}>
                <ApolloErrorAlert error={errorState.apolloError} />
              </Box>
            )}
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
            <Typography fontWeight={600} variant='body2'>
              Select Household Members for Submission
            </Typography>
            <Paper sx={{ mt: 2 }}>
              <HouseholdSummaryTable
                tabs={tabs}
                role={role}
                checked={checkedState}
                onClickCheckbox={onClickCheckbox}
                setCurrentTab={setCurrentTab}
              />
              <Box sx={{ px: 2, py: 3 }}>
                <LoadingButton
                  loading={loading}
                  onClick={() => handleSubmit(false)}
                  disabled={assessmentsToSubmit.length === 0}
                >
                  {`Submit (${assessmentsToSubmit.length}) ${startCase(
                    role.toLowerCase()
                  )}`}{' '}
                  {pluralize('Assessment', assessmentsToSubmit.length)}
                </LoadingButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        {renderValidationDialog({
          onConfirm: () => handleSubmit(true),
          loading,
          sectionLabels: mapValues(keyBy(tabs, 'assessmentId'), 'clientName'),
        })}
      </AlwaysMountedTabPanel>
    );
  }
);

HouseholdSummaryTabPanel.displayName = 'HouseholdSummaryTabPanel';

export default HouseholdSummaryTabPanel;
