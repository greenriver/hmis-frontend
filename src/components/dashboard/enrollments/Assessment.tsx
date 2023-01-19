import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import * as Sentry from '@sentry/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { useAssessmentHandlers } from './useAssessmentHandlers';

import {
  alertErrorFallback,
  ApolloErrorAlert,
} from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm from '@/modules/form/components/DynamicForm';
import FormStepper from '@/modules/form/components/FormStepper';
import RecordPickerDialog from '@/modules/form/components/RecordPickerDialog';
import { getInitialValues } from '@/modules/form/util/formUtil';
import { RelatedRecord } from '@/modules/form/util/recordPickerUtil';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { AssessmentRole, AssessmentWithValuesFragment } from '@/types/gqlTypes';

const Assessment = () => {
  const { enrollment, overrideBreadcrumbTitles } =
    useOutletContext<DashboardContext>();

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
    definition,
    assessment,
    dataLoading,
    mutationLoading,
    errors,
    assessmentTitle,
    assessmentRole,
    apolloError,
  } = useAssessmentHandlers();

  // Set initial values for the assessment. This happens on initial load,
  // and any time the user selects an assessment for autofilling the entire form.
  const initialValues = useMemo(() => {
    if (dataLoading || !definition || !enrollment) return;

    // Local values that may be referenced by the FormDefinition
    const localConstants = {
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
    };

    const source = sourceAssessment || assessment;
    let init;
    if (!source) {
      init = getInitialValues(definition, localConstants);
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
    dataLoading,
    enrollment,
    sourceAssessment,
    reloadInitialValues,
  ]);

  const informationDate = useMemo(() => {
    if (!enrollment) return;
    switch (assessmentRole) {
      case AssessmentRole.Intake:
        return enrollment.entryDate;
      case AssessmentRole.Exit:
        return enrollment.exitDate;
      default:
        return;
    }
  }, [enrollment, assessmentRole]);

  useEffect(() => {
    if (!assessmentTitle) return;
    // Override breadcrumb to include the assessment type and information date
    const route = assessment
      ? DashboardRoutes.VIEW_ASSESSMENT
      : DashboardRoutes.NEW_ASSESSMENT;
    const breadCrumbTitle = `${assessmentTitle} ${
      informationDate ? `for ${parseAndFormatDate(informationDate)}` : ''
    }`;
    overrideBreadcrumbTitles({ [route]: breadCrumbTitle });
  }, [assessmentTitle, informationDate, assessment, overrideBreadcrumbTitles]);

  useScrollToHash(
    !enrollment || dataLoading,
    STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT
  );

  if (dataLoading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

  return (
    <>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Stack direction='row'>
          <Typography variant='h4' sx={{ mb: 2, fontWeight: 400 }}>
            <b>{assessmentTitle}</b>
            {informationDate && ` ${parseAndFormatDate(informationDate)}`}
          </Typography>
        </Stack>
      </Box>
      <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
        {!definition && (
          <Alert severity='error'>
            <Stack direction={'row'} spacing={0.5}>
              <span>Unable to load form. </span>
              {import.meta.env.MODE === 'development' && (
                <>
                  <span>Did you run</span>
                  <Typography variant='body2' sx={{ fontFamily: 'Monospace' }}>
                    rails driver:hmis:seed_definitions
                  </Typography>
                  <span>?</span>
                </>
              )}
            </Stack>
          </Alert>
        )}
        {definition && (
          <>
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
                  <FormStepper items={definition.item} />
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
                definition={definition}
                onSubmit={submitHandler}
                onSaveDraft={
                  assessment && !assessment.inProgress
                    ? undefined
                    : saveDraftHandler
                }
                initialValues={initialValues || undefined}
                pickListRelationId={enrollment?.project?.id}
                loading={mutationLoading}
                errors={errors}
                showSavePrompt
              />
            </Grid>
          </>
        )}
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
    </>
  );
};

const WrappedAssessment = () => (
  <Box>
    <Sentry.ErrorBoundary fallback={alertErrorFallback}>
      <Assessment />
    </Sentry.ErrorBoundary>
  </Box>
);

export default WrappedAssessment;
