import { Grid, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

import { useAssessmentHandlers } from './useAssessmentHandlers';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { getInitialValues } from '@/modules/form/util/formUtil';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { AssessmentRole } from '@/types/gqlTypes';

const EditAssessment = () => {
  const [crumbs, crumbsLoading, enrollment] = useEnrollmentCrumbs('Assessment');

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

  useScrollToHash(crumbsLoading || dataLoading);

  if (crumbsLoading || dataLoading) return <Loading />;
  if (!crumbs) throw Error('Enrollment not found');

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Stack direction='row'>
        <Typography variant='h4' sx={{ mb: 2, fontWeight: 400 }}>
          <b>{assessmentTitle}</b>{' '}
          {informationDate && ` - ${parseAndFormatDate(informationDate)}`}
        </Typography>
      </Stack>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          {!definition && `ERROR: form definition not found`}
          {definition && (
            <DynamicForm
              definition={definition}
              onSubmit={submitHandler}
              onSaveDraft={
                assessment && !assessment.inProgress
                  ? undefined
                  : saveDraftHandler
              }
              initialValues={initialValues || undefined}
              loading={mutationLoading}
              errors={errors}
              showSavePrompt
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EditAssessment;
