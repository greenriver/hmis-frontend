import {
  Alert,
  AlertTitle,
  Box,
  CheckboxProps,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { fromPairs, isNil, keyBy, mapValues, pickBy } from 'lodash-es';
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
import { AssessmentStatus, TabDefinition, tabPanelA11yProps } from './util';

import { ApolloErrorAlert } from '@/components/elements/ErrorFallback';
import LoadingButton from '@/components/elements/LoadingButton';
import FormWarningDialog from '@/modules/form/components/FormWarningDialog';
import ValidationErrorDisplay from '@/modules/form/components/ValidationErrorDisplay';
import { cache } from '@/providers/apolloClient';
import {
  FormRole,
  SubmitHouseholdAssessmentsMutation,
  useSubmitHouseholdAssessmentsMutation,
  ValidationError,
  ValidationSeverity,
} from '@/types/gqlTypes';

interface HouseholdSummaryTabPanelProps {
  active: boolean;
  formRole: FormRole.Intake | FormRole.Exit;
  tabs: TabDefinition[];
  id: string;
  projectName: string;
  refetch: () => Promise<any>;
  setCurrentTab: Dispatch<SetStateAction<string | undefined>>;
}

type ErrorState = {
  warnings: ValidationError[];
  errors: ValidationError[];
};
const emptyErrorState: ErrorState = { warnings: [], errors: [] };

// Memoized to only re-render when props change (shallow compare)
const HouseholdSummaryTabPanel = memo(
  ({
    formRole,
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

    const [{ warnings, errors }, setErrors] =
      useState<ErrorState>(emptyErrorState);
    const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

    const [submitMutation, { loading, error: apolloError }] =
      useSubmitHouseholdAssessmentsMutation({
        onError: () => setErrors(emptyErrorState),
      });

    const assessmentsToSubmit = useMemo(
      () => Object.keys(pickBy(checkedState)),
      [checkedState]
    );

    useEffect(() => {
      setShowConfirmDialog(warnings.length > 0 && errors.length === 0);
    }, [errors, warnings]);

    const onCompleted = useCallback(
      ({ submitHouseholdAssessments }: SubmitHouseholdAssessmentsMutation) => {
        if (!submitHouseholdAssessments) return;
        if (submitHouseholdAssessments.errors.length > 0) {
          setErrors({
            warnings: submitHouseholdAssessments.errors.filter(
              (e) => e.severity === ValidationSeverity.Warning
            ),
            errors: submitHouseholdAssessments.errors.filter(
              (e) => e.severity === ValidationSeverity.Error
            ),
          });
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

    const onSubmit = useCallback(() => {
      submitMutation({
        variables: {
          input: { assessmentIds: assessmentsToSubmit, confirmed: false },
        },
        onCompleted,
      });
    }, [submitMutation, onCompleted, assessmentsToSubmit]);

    const onConfirm = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        submitMutation({
          variables: {
            input: { assessmentIds: assessmentsToSubmit, confirmed: true },
          },
          onCompleted,
        });
      },
      [submitMutation, onCompleted, assessmentsToSubmit]
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
            <Typography variant='h4' sx={{ mb: 3 }}>
              Complete {assessmentPrefix(formRole)} {projectName}
            </Typography>
            {apolloError && (
              <Box sx={{ mb: 3 }}>
                <ApolloErrorAlert error={apolloError} />
              </Box>
            )}
            {errors.length > 0 && (
              <Grid item>
                <Alert
                  severity='error'
                  sx={{ mb: 3 }}
                  data-testid='formErrorAlert'
                >
                  <AlertTitle>Failed to submit</AlertTitle>
                  <ValidationErrorDisplay errors={errors} />
                </Alert>
              </Grid>
            )}
            <Typography fontWeight={600} variant='body2'>
              Select Household Members for Submission
            </Typography>
            <Paper sx={{ mt: 2 }}>
              <HouseholdSummaryTable
                tabs={tabs}
                role={formRole}
                checked={checkedState}
                onClickCheckbox={onClickCheckbox}
                setCurrentTab={setCurrentTab}
              />
              <Box sx={{ px: 2, py: 3 }}>
                <LoadingButton
                  loading={loading}
                  onClick={onSubmit}
                  disabled={assessmentsToSubmit.length === 0}
                >
                  {`Submit (${assessmentsToSubmit.length}) ${
                    formRole === FormRole.Intake ? 'Intake' : 'Exit'
                  }`}{' '}
                  {pluralize('Assessment', assessmentsToSubmit.length)}
                </LoadingButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        {showConfirmDialog && (
          <FormWarningDialog
            open
            onConfirm={onConfirm}
            onCancel={() => setShowConfirmDialog(false)}
            loading={loading || false}
            warnings={warnings}
            sectionLabels={mapValues(keyBy(tabs, 'assessmentId'), 'clientName')}
          />
        )}
      </AlwaysMountedTabPanel>
    );
  }
);

HouseholdSummaryTabPanel.displayName = 'HouseholdSummaryTabPanel';

export default HouseholdSummaryTabPanel;
