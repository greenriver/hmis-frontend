import { Grid, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import DynamicForm from '@/modules/form/components/DynamicForm';
import FormDefinitions from '@/modules/form/definitions';
import { useGetAssessmentQuery } from '@/types/gqlTypes';

const EditAssessment = () => {
  const { assessmentId } = useParams() as {
    assessmentId: string;
  };
  const [crumbs, crumbsLoading] = useEnrollmentCrumbs('Assessment');
  const { data, loading, error } = useGetAssessmentQuery({
    variables: { id: assessmentId },
  });

  const submitHandler = useCallback(() => console.log('TODO'), []);

  if (crumbsLoading || loading) return <Loading />;
  if (!crumbs) throw Error('Enrollment not found');
  if (error) throw error;

  const identifier = data?.assessment?.assessmentDetail?.definition.identifier;
  const formDefinition = identifier ? FormDefinitions[identifier] : undefined;

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h4' sx={{ mb: 2 }}>
        {formDefinition?.title || 'Assessment'}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          {!formDefinition &&
            `ERROR: no form definition for identifier '${identifier || ''}'`}
          {formDefinition && (
            <DynamicForm
              definition={formDefinition}
              // mappingKey={mappingKey}
              onSubmit={submitHandler}
              submitButtonText='Save Changes'
              discardButtonText='Go back'
              // initialValues={initialValues}
              loading={loading}
              // errors={errors}
              // {...props}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EditAssessment;
