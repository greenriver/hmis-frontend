import { Alert, Grid, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { getInitialValues } from '@/modules/form/util/formUtil';
import {
  AssessmentRole,
  useCreateAssessmentMutation,
  useGetFormDefinitionQuery,
  ValidationError,
} from '@/types/gqlTypes';

// TODO if this is an intake and they already have one, redirect them there...?
const NewAssessment = () => {
  const {
    // clientId,
    enrollmentId,
    assessmentRole: assessmentRoleParam,
  } = useParams() as {
    // clientId: string;
    enrollmentId: string;
    assessmentRole: string;
  };
  const [errors, setErrors] = useState<ValidationError[] | undefined>();
  const navigate = useNavigate();
  const assessmentRole = useMemo(() => {
    if (
      !Object.values<string>(AssessmentRole).includes(
        assessmentRoleParam.toUpperCase()
      )
    ) {
      throw Error(`Unrecognized role ${assessmentRoleParam}`);
    }
    return assessmentRoleParam.toUpperCase() as AssessmentRole;
  }, [assessmentRoleParam]);
  const title = `${startCase(assessmentRole.toLowerCase())} Assessment`;

  const { data, loading, error } = useGetFormDefinitionQuery({
    variables: { enrollmentId, assessmentRole },
  });
  const [crumbs, crumbsLoading] = useEnrollmentCrumbs(title);

  const [createAssessmentMutation, { loading: saveLoading, error: saveError }] =
    useCreateAssessmentMutation({
      onCompleted: (data) => {
        const errors = data.createAssessment?.errors;
        if ((errors || []).length > 0) {
          window.scrollTo(0, 0);
          setErrors(errors);
        } else {
          navigate(-1);
        }
      },
    });

  const formDefinition = data?.getFormDefinition;
  const definition = formDefinition?.definition;

  const submitHandler = useCallback(
    (values: Record<string, any>) => {
      if (!formDefinition) return;
      console.log('Saved form state', values);
      const variables = {
        formDefinitionId: formDefinition.id,
        enrollmentId,
        inProgress: false,
        values,
      };

      void createAssessmentMutation({ variables });
    },
    [createAssessmentMutation, enrollmentId, formDefinition]
  );
  const submitDraftHandler = useCallback(
    (values: Record<string, any>) => {
      if (!formDefinition) return;
      console.log('Saved form state', values);
      const variables = {
        formDefinitionId: formDefinition.id,
        enrollmentId,
        inProgress: true,
        values: JSON.stringify(values),
      };

      void createAssessmentMutation({ variables });
    },
    [createAssessmentMutation, enrollmentId, formDefinition]
  );

  const initialValues = useMemo(
    () => (definition ? getInitialValues(definition) : undefined),
    [definition]
  );

  if (crumbsLoading) return <Loading />;
  if (!crumbs) throw Error('Enrollment not found');
  if (error) throw error;
  if (saveError) throw saveError;

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Grid container spacing={4} sx={{ pb: 20 }}>
        <Grid item xs={9}>
          {loading && <Loading />}
          {!loading && !definition && (
            <Alert severity='error'>{`Unable to load ${title} form.`}</Alert>
          )}
          {definition && (
            <>
              <Typography
                variant='h3'
                sx={{ mb: 3, textTransform: 'capitalize' }}
              >
                {title}
              </Typography>
              <DynamicForm
                definition={definition}
                initialValues={initialValues}
                onSubmit={submitHandler}
                onSaveDraft={submitDraftHandler}
                loading={saveLoading}
                errors={errors}
                showSavePrompt
                horizontal
              />
            </>
          )}
        </Grid>
        <Grid item xs></Grid>
      </Grid>
    </>
  );
};

export default NewAssessment;
