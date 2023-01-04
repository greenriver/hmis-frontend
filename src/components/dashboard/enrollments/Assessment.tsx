import { Alert, Box, Grid, Paper, Stack, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

import { useAssessmentHandlers } from './useAssessmentHandlers';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import {
  alertErrorFallback,
  ApolloErrorAlert,
} from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm from '@/modules/form/components/DynamicForm';
import FormStepper from '@/modules/form/components/FormStepper';
import { getInitialValues } from '@/modules/form/util/formUtil';
import { clientName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { AssessmentRole, Client } from '@/types/gqlTypes';

const Assessment = () => {
  const { client } = useOutletContext<{ client: Client | null }>();

  const [crumbs, crumbsLoading, enrollment] = useEnrollmentCrumbs();

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

  const crumbsWithDetails = useMemo(() => {
    if (!crumbs || !client || !assessmentTitle) return;
    return [
      ...crumbs,
      { label: `${assessmentTitle} for ${clientName(client)}`, to: '' },
    ];
  }, [crumbs, assessmentTitle, client]);

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

  useScrollToHash(crumbsLoading || dataLoading, 99);

  if (crumbsLoading || dataLoading) return <Loading />;
  if (!crumbs) throw Error('Enrollment not found');

  return (
    <>
      <Box
        sx={{
          position: 'sticky',
          top: 10,
          backgroundColor: (theme) => theme.palette.background.default,
          zIndex: (theme) => theme.zIndex.appBar,
          // hack to add 15px of space on top of crumbs when scrolled to the top
          '&:before': {
            content: '""',
            backgroundColor: (theme) => theme.palette.background.default,
            position: 'absolute',
            height: '15px',
            mt: '-15px',
            width: '100%',
          },
        }}
      >
        {crumbsWithDetails && <Breadcrumbs crumbs={crumbsWithDetails} />}
        <Stack direction='row'>
          <Typography variant='h4' sx={{ mb: 4, fontWeight: 400 }}>
            <b>{assessmentTitle}</b>
            {informationDate && ` ${parseAndFormatDate(informationDate)}`}
          </Typography>
        </Stack>
      </Box>
      <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
        {!definition && <Alert severity='error'>Unable to load form.</Alert>}
        {definition && (
          <>
            <Grid item xs={2.5} sx={{ pr: 2, pt: '0 !important' }}>
              <Paper
                sx={{
                  p: 3,
                  position: 'sticky',
                  top: '115px', // hacky way to line up with top of form contents
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
