import { Grid, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { DashboardRoutes } from '@/routes/routes';
import {
  useGetAssessmentQuery,
  useSaveAssessmentMutation,
  ValidationError,
} from '@/types/gqlTypes';

const EditAssessment = () => {
  const { clientId, enrollmentId, assessmentId } = useParams() as {
    clientId: string;
    enrollmentId: string;
    assessmentId: string;
  };
  const navigate = useNavigate();
  const [errors, setErrors] = useState<ValidationError[] | undefined>();
  const [crumbs, crumbsLoading] = useEnrollmentCrumbs('Assessment');
  const { data, loading, error } = useGetAssessmentQuery({
    variables: { id: assessmentId },
  });

  const [saveAssessmentMutation, { loading: saveLoading, error: saveError }] =
    useSaveAssessmentMutation({
      onCompleted: (data) => {
        const errors = data.saveAssessment?.errors;
        if ((errors || []).length > 0) {
          window.scrollTo(0, 0);
          setErrors(errors);
        } else if (!data.saveAssessment?.assessment?.inProgress) {
          navigate(
            generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
              clientId,
              enrollmentId,
            })
          );
        }
      },
    });

  const submitHandler = useCallback(
    (values: Record<string, any>) => {
      // if (!formDefinition) return;
      console.log('Saved form state', values);
      const variables = {
        assessmentId,
        inProgress: false,
        values,
      };

      void saveAssessmentMutation({ variables });
    },
    [saveAssessmentMutation, assessmentId]
  );

  const saveDraftHandler = useCallback(
    (values: Record<string, any>) => {
      // if (!formDefinition) return;
      console.log('Saved form state:', values);
      const variables = {
        assessmentId,
        inProgress: true,
        values,
      };

      void saveAssessmentMutation({ variables });
    },
    [saveAssessmentMutation, assessmentId]
  );

  const initialValues = useMemo(() => {
    // TODO merge with getInitialValues(definition) ?
    const values = data?.assessment?.assessmentDetail?.values;
    if (!values) return;
    if (typeof values === 'string') return JSON.parse(values);
    console.log('Initial form state:', values);
    return values;
  }, [data]);

  const title = useMemo(() => {
    const assessmentRole = data?.assessment?.assessmentDetail?.role;
    return `${
      assessmentRole ? startCase(assessmentRole.toLowerCase()) : ''
    } Assessment`;
  }, [data]);

  if (crumbsLoading || loading) return <Loading />;
  if (!crumbs) throw Error('Enrollment not found');
  if (error) throw error;
  if (saveError) console.error(saveError);

  const identifier = data?.assessment?.assessmentDetail?.definition.identifier;
  const formDefinition =
    data?.assessment?.assessmentDetail?.definition?.definition;
  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Typography variant='h4' sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={9}>
          {!formDefinition &&
            `ERROR: no form definition for identifier '${identifier || ''}'`}
          {formDefinition && (
            <DynamicForm
              definition={formDefinition}
              onSubmit={submitHandler}
              onSaveDraft={saveDraftHandler}
              initialValues={initialValues || undefined}
              loading={saveLoading}
              errors={errors}
              showSavePrompt
              horizontal
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default EditAssessment;
