import { Alert, Box, Grid, Paper, Stack, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useEffect, useMemo } from 'react';
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
import { getInitialValues } from '@/modules/form/util/formUtil';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';

const Assessment = () => {
  const { enrollment, overrideBreadcrumbTitles } =
    useOutletContext<DashboardContext>();

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

  const initialValues = useMemo(() => {
    if (dataLoading || !definition || !enrollment) return;

    // Local values that may be referenced by the FormDefinition
    const localConstants = {
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
    };

    let init;
    if (!assessment) {
      init = getInitialValues(definition, localConstants);
    } else {
      const values = assessment.assessmentDetail?.values;
      // FIXME make consistent
      init = typeof values === 'string' ? JSON.parse(values) : values;
      // Should we merge with initial values here?
    }
    console.debug('Initial Form State', init);
    return init;
  }, [assessment, definition, dataLoading, enrollment]);

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
          <Typography variant='h4' sx={{ mb: 2, kfontWeight: 400 }}>
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
              <Paper
                sx={{
                  p: 3,
                  position: 'sticky',
                  top: STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT + 16,
                }}
              >
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Form Navigation
                </Typography>
                <FormStepper items={definition.item} />
              </Paper>
            </Grid>
            <Grid item xs={9} sx={{ pt: '0 !important' }}>
              {apolloError && (
                <Box sx={{ mb: 3 }}>
                  <ApolloErrorAlert error={apolloError} />
                </Box>
              )}
              <DynamicForm
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
