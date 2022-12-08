import { startCase } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router-dom';

import { FormValues } from '@/modules/form/util/formUtil';
import { transformSubmitValues } from '@/modules/form/util/recordFormUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  AssessmentWithDefinitionAndValuesFragment,
  FormDefinitionJson,
  useGetAssessmentQuery,
  useGetFormDefinitionQuery,
  useSaveAssessmentMutation,
  useSubmitAssessmentMutation,
  ValidationError,
} from '@/types/gqlTypes';

export function useAssessmentHandlers() {
  const [errors, setErrors] = useState<ValidationError[] | undefined>();
  const { clientId, enrollmentId, assessmentId, assessmentRole } =
    useParams() as {
      clientId: string;
      enrollmentId: string;
      assessmentId?: string;
      assessmentRole?: string;
    };
  const navigate = useNavigate();

  const role = useMemo(() => {
    if (!assessmentRole) return;
    if (
      !Object.values<string>(AssessmentRole).includes(
        assessmentRole.toUpperCase()
      )
    ) {
      // should be 404
      throw Error(`Unrecognized role ${assessmentRole}`);
    }
    return assessmentRole.toUpperCase() as AssessmentRole;
  }, [assessmentRole]);

  const {
    data: formDefinitionData,
    loading: formDefinitionLoading,
    error: formDefinitionError,
  } = useGetFormDefinitionQuery({
    variables: {
      enrollmentId,
      assessmentRole: role as AssessmentRole,
    },
    skip: !role, // skip if editing an existing assessment
  });

  const {
    data: assessmentData,
    loading: assessmentLoading,
    error: assessmentError,
  } = useGetAssessmentQuery({
    variables: { id: assessmentId as string },
    skip: !assessmentId, // skip if creating a new assessment
  });

  const definition = useMemo(
    () =>
      formDefinitionData?.getFormDefinition?.definition ||
      assessmentData?.assessment?.assessmentDetail?.definition?.definition,
    [formDefinitionData, assessmentData]
  );

  const assessmentTitle = useMemo(() => {
    const arole = assessmentData?.assessment?.assessmentDetail?.role || role;
    return `${arole ? startCase(arole.toLowerCase()) : ''} Assessment`;
  }, [assessmentData, role]);

  const formDefinitionId = useMemo(
    () => formDefinitionData?.getFormDefinition?.id,
    [formDefinitionData]
  );

  const enrollmentPath = useMemo(
    () =>
      generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
        enrollmentId,
        clientId,
      }),
    [enrollmentId, clientId]
  );

  const [saveAssessmentMutation, { loading: saveLoading, error: saveError }] =
    useSaveAssessmentMutation({
      onCompleted: (data) => {
        const errors = data.saveAssessment?.errors || [];
        if (errors.length > 0) {
          window.scrollTo(0, 0);
          setErrors(errors);
        } else {
          navigate(enrollmentPath);
        }
      },
    });

  const [
    submitAssessmentMutation,
    { loading: submitLoading, error: submitError },
  ] = useSubmitAssessmentMutation({
    onCompleted: (data) => {
      const errors = data.submitAssessment?.errors || [];
      if (errors.length > 0) {
        window.scrollTo(0, 0);
        setErrors(errors);
      } else {
        navigate(enrollmentPath);
      }
    },
  });

  const submitHandler = useCallback(
    (values: FormValues) => {
      if (!definition) return;
      const hudValues = transformSubmitValues({ definition, values });
      const variables = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values,
        hudValues,
      };
      console.debug('Submitting', variables);
      void submitAssessmentMutation({ variables });
    },
    [
      submitAssessmentMutation,
      assessmentId,
      definition,
      formDefinitionId,
      enrollmentId,
    ]
  );

  const saveDraftHandler = useCallback(
    (values: FormValues) => {
      const variables = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values: values,
      };
      console.debug('Saving', variables);
      void saveAssessmentMutation({ variables });
    },
    [saveAssessmentMutation, assessmentId, formDefinitionId, enrollmentId]
  );

  if (saveError) throw saveError;
  if (submitError) throw submitError;
  if (formDefinitionError) throw formDefinitionError;
  if (assessmentError) throw assessmentError;

  return {
    submitHandler,
    saveDraftHandler,
    assessmentTitle,
    definition,
    assessment: assessmentData?.assessment,
    dataLoading: formDefinitionLoading || assessmentLoading,
    mutationLoading: saveLoading || submitLoading,
    errors,
  } as {
    submitHandler: (values: FormValues, confirmed?: boolean) => void;
    saveDraftHandler: (values: FormValues) => void;
    assessmentTitle: string;
    definition?: FormDefinitionJson;
    assessment?: AssessmentWithDefinitionAndValuesFragment;
    dataLoading: boolean;
    mutationLoading: boolean;
    errors: ValidationError[];
  };
}
