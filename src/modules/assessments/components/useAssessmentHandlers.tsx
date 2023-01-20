import { ApolloError } from '@apollo/client';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormValues } from '@/modules/form/util/formUtil';
import { transformSubmitValues } from '@/modules/form/util/recordFormUtil';
import { cache } from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import {
  FormDefinition,
  SaveAssessmentMutation,
  SubmitAssessmentMutation,
  useSaveAssessmentMutation,
  useSubmitAssessmentMutation,
  ValidationError,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export function useAssessmentHandlers(
  definition: FormDefinition,
  clientId: string,
  enrollmentId: string,
  assessmentId?: string,
  navigateOnComplete?: boolean
) {
  const formDefinitionId = definition.id;

  const [errors, setErrors] = useState<ValidationError[] | undefined>();

  const navigate = useNavigate();

  const handleCompleted = useCallback(
    (data: SubmitAssessmentMutation | SaveAssessmentMutation) => {
      let errors;
      if (data.hasOwnProperty('saveAssessment')) {
        errors = (data as SaveAssessmentMutation).saveAssessment?.errors || [];
      } else {
        errors =
          (data as SubmitAssessmentMutation).submitAssessment?.errors || [];
      }
      if (errors.length > 0) {
        window.scrollTo(0, 0);
        setErrors(errors);
        return;
      }

      // Save/Submit was successful.
      // If we created a NEW assessment, clear assessment queries from cache so the table reloads.
      if (!assessmentId) {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'assessments',
        });
      }

      if (navigateOnComplete) {
        navigate(
          generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
            enrollmentId,
            clientId,
          })
        );
      }
    },
    [
      enrollmentId,
      clientId,
      setErrors,
      assessmentId,
      navigate,
      navigateOnComplete,
    ]
  );

  const [saveAssessmentMutation, { loading: saveLoading, error: saveError }] =
    useSaveAssessmentMutation({
      onCompleted: handleCompleted,
      onError: () => window.scrollTo(0, 0),
    });

  const [
    submitAssessmentMutation,
    { loading: submitLoading, error: submitError },
  ] = useSubmitAssessmentMutation({
    onCompleted: handleCompleted,
    onError: () => window.scrollTo(0, 0),
  });

  const submitHandler = useCallback(
    (values: FormValues) => {
      if (!definition) return;
      const hudValues = transformSubmitValues({
        definition: definition.definition,
        values,
      });
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

  return {
    submitHandler,
    saveDraftHandler,
    mutationLoading: saveLoading || submitLoading,
    errors,
    apolloError: saveError || submitError,
  } as {
    submitHandler: (values: FormValues, confirmed?: boolean) => void;
    saveDraftHandler: (values: FormValues) => void;
    dataLoading: boolean;
    mutationLoading: boolean;
    errors: ValidationError[];
    apolloError?: ApolloError;
  };
}
