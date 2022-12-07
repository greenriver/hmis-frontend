import { Grid, Typography } from '@mui/material';
import { useMemo } from 'react';

import { useAssessmentHandlers } from './useAssessmentHandlers';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { getInitialValues } from '@/modules/form/util/formUtil';

const EditAssessment = () => {
  const [crumbs, crumbsLoading] = useEnrollmentCrumbs('Assessment');

  const {
    submitHandler,
    saveDraftHandler,
    definition,
    assessment,
    dataLoading,
    mutationLoading,
    errors,
    assessmentTitle,
  } = useAssessmentHandlers();

  const initialValues = useMemo(() => {
    if (dataLoading || !definition) return;
    let init;
    if (!assessment) {
      init = getInitialValues(definition);
    } else {
      const values = assessment.assessmentDetail?.values;
      // FIXME make consistent
      init = typeof values === 'string' ? JSON.parse(values) : values;
      // Should we merge with initial values here?
    }
    console.debug('Initial Form State', init);
    return init;
  }, [assessment, definition, dataLoading]);

  if (crumbsLoading || dataLoading) return <Loading />;
  if (!crumbs) throw Error('Enrollment not found');

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h4' sx={{ mb: 2 }}>
        {assessmentTitle}
      </Typography>
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
