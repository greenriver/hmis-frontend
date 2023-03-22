import {
  Alert,
  AlertTitle,
  Box,
  Checkbox,
  CheckboxProps,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { fromPairs, isNil, keyBy, mapValues, pickBy } from 'lodash-es';
import pluralize from 'pluralize';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { assessmentPrefix } from '../../util';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import { AssessmentStatus, TabDefinition, tabPanelA11yProps } from './util';

import { ApolloErrorAlert } from '@/components/elements/ErrorFallback';
import GenericTable, { ColumnDef } from '@/components/elements/GenericTable';
import LoadingButton from '@/components/elements/LoadingButton';
import FormWarningDialog from '@/modules/form/components/FormWarningDialog';
import ValidationErrorDisplay from '@/modules/form/components/ValidationErrorDisplay';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  FormRole,
  SubmitHouseholdAssessmentsMutation,
  useSubmitHouseholdAssessmentsMutation,
  ValidationError,
  ValidationSeverity,
} from '@/types/gqlTypes';

const SummaryTable = ({
  tabs,
  role,
  checked,
  onClickCheckbox,
}: {
  tabs: TabDefinition[];
  role: FormRole.Intake | FormRole.Exit;
  checked: Record<string, boolean>;
  onClickCheckbox: (...assessmentIds: string[]) => CheckboxProps['onChange'];
}) => {
  const columns: ColumnDef<TabDefinition>[] = useMemo(() => {
    const submittable = tabs
      .filter((tab) => tab.assessmentId && tab.assessmentInProgress)
      .map(({ assessmentId }) => assessmentId) as string[];

    return [
      {
        key: 'checkbox',
        textAlign: 'center',
        header: (
          <>
            <Checkbox
              // checked={!!(row.assessmentId && checked[row.assessmentId])}
              disabled={submittable.length === 0}
              onChange={(...args) => {
                const func = onClickCheckbox(...submittable);
                if (func) func(...args);
              }}
              aria-label={`Select All`}
            />
          </>
        ),
        width: '10%',
        render: (row) => {
          const disabledReason = !row.assessmentId
            ? 'Not started'
            : row.status === AssessmentStatus.Submitted
            ? 'Submitted'
            : undefined;
          if (disabledReason) {
            return (
              <Typography
                variant='caption'
                color={'text.secondary'}
                fontStyle='italic'
                sx={{ pl: 2, whiteSpace: 'no-wrap' }}
              >
                {disabledReason}
              </Typography>
            );
          }

          return (
            // <ButtonTooltipContainer title={disabledReason}>
            <Checkbox
              checked={!!(row.assessmentId && checked[row.assessmentId])}
              indeterminate={row.status === AssessmentStatus.Submitted}
              disabled={!!disabledReason}
              onChange={
                row.assessmentId ? onClickCheckbox(row.assessmentId) : undefined
              }
              aria-label={`Submit assessment for ${row.clientName} `}
            />
            // </ButtonTooltipContainer>
          );
        },
      },
      {
        header: '',
        key: 'hoh-indicator',
        width: '5%',
        render: ({ relationshipToHoH }) => (
          <HohIndicator relationshipToHoh={relationshipToHoH} />
        ),
      },
      {
        header: 'Name',
        key: 'name',
        width: '20%',
        render: ({ clientName }) => <Typography>{clientName}</Typography>,
      },
      {
        header: `${role === FormRole.Exit ? 'Exit' : 'Entry'} Status`,
        key: 'status',
        width: '20%',
        render: () => <Typography>TODO</Typography>,
      },
      {
        header: `${role === FormRole.Exit ? 'Exit' : 'Entry'} Date`,
        key: 'date',
        width: '10%',
        render: (row) => (
          <Typography>
            {/* // FIXME this should be the actual entry/exit date if no assmt */}
            {row.assessmentDate ? parseAndFormatDate(row.assessmentDate) : null}
          </Typography>
        ),
      },
    ];
  }, [checked, onClickCheckbox, role, tabs]);
  return (
    <GenericTable<TabDefinition>
      rows={tabs}
      columns={columns}
      rowSx={() => ({
        // HoH indicator column
        'td:nth-of-type(1)': { px: 0 },
      })}
    />
  );
};

interface HouseholdSummaryTabPanelProps {
  active: boolean;
  formRole: FormRole.Intake | FormRole.Exit;
  tabs: TabDefinition[];
  id: string;
  projectName: string;
  refetch: () => Promise<any>;
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
              <SummaryTable
                tabs={tabs}
                role={formRole}
                checked={checkedState}
                onClickCheckbox={onClickCheckbox}
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
                  {pluralize(
                    'Assessment',
                    assessmentsToSubmit.length,
                    assessmentsToSubmit.length > 0
                  )}
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
