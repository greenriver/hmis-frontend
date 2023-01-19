import { Box, Button, Grid, Paper, Tooltip, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useCallback, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { useAssessmentHandlers } from './useAssessmentHandlers';

import {
  alertErrorFallback,
  ApolloErrorAlert,
} from '@/components/elements/ErrorFallback';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import useSafeParams from '@/hooks/useSafeParams';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm from '@/modules/form/components/DynamicForm';
import FormStepper from '@/modules/form/components/FormStepper';
import RecordPickerDialog from '@/modules/form/components/RecordPickerDialog';
import { getInitialValues } from '@/modules/form/util/formUtil';
import { RelatedRecord } from '@/modules/form/util/recordPickerUtil';
import {
  AssessmentRole,
  AssessmentWithDefinitionAndValuesFragment,
  AssessmentWithValuesFragment,
  FormDefinition,
} from '@/types/gqlTypes';

interface Props {
  // assessmentTitle: string;
  assessmentRole?: AssessmentRole;
  definition: FormDefinition;
  assessment?: AssessmentWithDefinitionAndValuesFragment;
}
const Assessment = ({ assessment, assessmentRole, definition }: Props) => {
  const { enrollment } = useOutletContext<DashboardContext>();
  const { clientId, enrollmentId, assessmentId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    assessmentId?: string;
  };
  // Whether record picker dialog is open for autofill
  const [dialogOpen, setDialogOpen] = useState(false);

  // Most recently selected "source" assesment for autofill
  const [sourceAssessment, setSourceAssessment] = useState<
    AssessmentWithValuesFragment | undefined
  >();
  // Trigger for reloading initial values and form if a source assesment is chosen for autofill.
  // This is needed to support re-selecting the same assessment (which should clear and reload the form again)
  const [reloadInitialValues, setReloadInitialValues] = useState(false);

  const onSelectAutofillRecord = useCallback((record: RelatedRecord) => {
    setSourceAssessment(record as AssessmentWithValuesFragment);
    setDialogOpen(false);
    setReloadInitialValues((old) => !old);
  }, []);

  const {
    submitHandler,
    saveDraftHandler,
    mutationLoading,
    errors,
    apolloError,
  } = useAssessmentHandlers(definition, clientId, enrollmentId, assessmentId);

  // Set initial values for the assessment. This happens on initial load,
  // and any time the user selects an assessment for autofilling the entire form.
  const initialValues = useMemo(() => {
    if (mutationLoading || !definition || !enrollment) return;

    // Local values that may be referenced by the FormDefinition
    const localConstants = {
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
    };

    const source = sourceAssessment || assessment;
    let init;
    if (!source) {
      init = getInitialValues(definition.definition, localConstants);
    } else {
      const values = source.assessmentDetail?.values;
      // FIXME make consistent
      init = typeof values === 'string' ? JSON.parse(values) : values;
      // Should we merge with initial values here?
    }
    console.debug(
      'Initial Form State',
      init,
      'from source:',
      source?.id || 'none'
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unused = reloadInitialValues; // reference trigger
    return init;
  }, [
    assessment,
    definition,
    mutationLoading,
    enrollment,
    sourceAssessment,
    reloadInitialValues,
  ]);

  useScrollToHash(
    !enrollment || mutationLoading,
    STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT
  );

  // if (dataLoading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

  return (
    <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
      <Grid item xs={2.5} sx={{ pr: 2, pt: '0 !important' }}>
        <Box
          sx={{
            position: 'sticky',
            top: STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT + 16,
          }}
        >
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Form Navigation
            </Typography>
            <FormStepper items={definition.definition.item} />
          </Paper>

          {!assessment && (
            <Tooltip
              title={
                'Choose a previous assessment to copy into this assessment'
              }
              placement='bottom-end'
              arrow
            >
              <Button
                variant='outlined'
                onClick={() => setDialogOpen(true)}
                sx={{ height: 'fit-content', mt: 3 }}
                fullWidth
              >
                Autofill Assessment
              </Button>
            </Tooltip>
          )}
        </Box>
      </Grid>
      <Grid item xs={9} sx={{ pt: '0 !important' }}>
        {apolloError && (
          <Box sx={{ mb: 3 }}>
            <ApolloErrorAlert error={apolloError} />
          </Box>
        )}
        <DynamicForm
          // Remount component if a source assessment has been selected
          key={`${sourceAssessment?.id}-${reloadInitialValues}`}
          definition={definition.definition}
          onSubmit={submitHandler}
          onSaveDraft={
            assessment && !assessment.inProgress ? undefined : saveDraftHandler
          }
          initialValues={initialValues || undefined}
          pickListRelationId={enrollment?.project?.id}
          loading={mutationLoading}
          errors={errors}
          showSavePrompt
        />
      </Grid>

      {/* Dialog for selecting autofill record */}
      {definition && (
        <RecordPickerDialog
          id='assessmentPickerDialog'
          recordType='Assessment'
          open={dialogOpen}
          role={assessmentRole}
          onSelected={onSelectAutofillRecord}
          onCancel={() => setDialogOpen(false)}
          description={
            // <Alert severity='info' icon={false} sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ mb: 2 }}>
              Select a previous assessment to populate the current assessment.
              Any changes you have made will be overwritten.
            </Typography>
            // </Alert>
          }
        />
      )}
    </Grid>
  );
};

const WrappedAssessment = (props: Props) => (
  <Box>
    <Sentry.ErrorBoundary fallback={alertErrorFallback}>
      <Assessment {...props} />
    </Sentry.ErrorBoundary>
  </Box>
);

export default WrappedAssessment;
