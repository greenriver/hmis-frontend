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
import { fromPairs, keyBy, mapValues, pickBy } from 'lodash-es';
import pluralize from 'pluralize';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { assessmentPrefix } from '../../util';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import {
  AssessmentStatus,
  labelForStatus,
  TabDefinition,
  tabPanelA11yProps,
} from './util';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { ApolloErrorAlert } from '@/components/elements/ErrorFallback';
import LoadingButton from '@/components/elements/LoadingButton';
import SimpleTable from '@/components/elements/SimpleTable';
import FormWarningDialog from '@/modules/form/components/FormWarningDialog';
import ValidationErrorDisplay from '@/modules/form/components/ValidationErrorDisplay';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  AssessmentRole,
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
  role: AssessmentRole.Intake | AssessmentRole.Exit;
  checked: Record<string, boolean>;
  onClickCheckbox: (assessmentId?: string) => CheckboxProps['onChange'];
}) => {
  return (
    <SimpleTable
      headers
      TableCellProps={{
        sx: {
          borderBottom: 0,
          py: 0.5,
          px: 1,
          '&:first-of-type': {
            pl: 0,
            width: '1px',
            // maxWidth: '100px',
            // whiteSpace: 'nowrap',
            verticalAlign: 'baseline',
          },
          '&:nth-of-type(2)': {
            pl: 0,
            width: '1px',
            verticalAlign: 'baseline',
          },
          '&:nth-of-type(3)': {
            maxWidth: '300px',
          },
        },
      }}
      columns={[
        {
          name: 'hoh',
          label: <></>,
          render: (row) => (
            <HohIndicator relationshipToHoh={row.relationshipToHoH} />
          ),
        },
        {
          name: 'submit',
          label: <></>,
          render: (row) => {
            const disabledReason = !row.assessmentId
              ? 'Not started'
              : row.status === AssessmentStatus.Submitted
              ? 'Already submitted'
              : undefined;
            return (
              <ButtonTooltipContainer title={disabledReason}>
                <Checkbox
                  checked={!!row.assessmentId && checked[row.assessmentId]}
                  indeterminate={!!disabledReason}
                  disabled={!!disabledReason}
                  onChange={onClickCheckbox(row.assessmentId)}
                  aria-label={`Submit assessment for ${row.clientName} `}
                />
              </ButtonTooltipContainer>
            );
          },
        },
        {
          name: 'Client',
          label: <Typography fontWeight={600}>Client</Typography>,
          render: (row) => <Typography>{row.clientName}</Typography>,
        },
        {
          name: 'Assessment Status',
          label: (
            <Typography fontWeight={600}>
              {role === AssessmentRole.Exit ? 'Exit' : 'Intake'} Assessment
              Status
            </Typography>
          ),
          render: (row) => (
            <Typography
              color={
                row.status === AssessmentStatus.ReadyToSubmit
                  ? (theme) => theme.palette.success.main
                  : 'text.primary'
              }
              fontWeight={
                row.status === AssessmentStatus.ReadyToSubmit ? 600 : 400
              }
            >
              {labelForStatus(row.status)}
            </Typography>
          ),
        },
        {
          name: 'date',
          label: (
            <Typography fontWeight={600}>
              {role === AssessmentRole.Exit ? 'Exit' : 'Entry'} Date
            </Typography>
          ),
          render: (row) => (
            <Typography>
              {row.assessmentDate
                ? parseAndFormatDate(row.assessmentDate)
                : 'Not Specified'}
            </Typography>
          ),
        },
      ]}
      rows={tabs}
    />
  );
};

interface HouseholdSummaryTabPanelProps {
  active: boolean;
  assessmentRole: AssessmentRole.Intake | AssessmentRole.Exit;
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
    assessmentRole,
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

    const onClickCheckbox: (
      assessmentId?: string
    ) => CheckboxProps['onChange'] = useCallback(
      (assessmentId) => (_event, checked) => {
        if (!assessmentId) return;
        setCheckedState((old) => {
          const copy = { ...old };
          copy[assessmentId] = checked;
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
        console.log('oncompleted', submitHouseholdAssessments);
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
        } else if (submitHouseholdAssessments.assessments) {
          setErrors(emptyErrorState);
          refetch();
        }
      },
      [refetch]
    );

    const onSubmit = useCallback(() => {
      console.log('submitting', assessmentsToSubmit);
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

    if (apolloError) console.error(apolloError);

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
              Complete {assessmentPrefix(assessmentRole)} {projectName}
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
            <Paper sx={{ p: 2 }}>
              <SummaryTable
                tabs={tabs}
                role={assessmentRole}
                checked={checkedState}
                onClickCheckbox={onClickCheckbox}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={10} lg={8} sx={{ py: 3 }}>
            <LoadingButton
              loading={loading}
              onClick={onSubmit}
              disabled={assessmentsToSubmit.length === 0}
            >
              Submit{' '}
              {pluralize(
                'assessment',
                assessmentsToSubmit.length,
                assessmentsToSubmit.length > 0
              )}
            </LoadingButton>
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

export default HouseholdSummaryTabPanel;
