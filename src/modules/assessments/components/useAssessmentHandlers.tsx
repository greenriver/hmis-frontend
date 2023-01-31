import { ApolloError } from '@apollo/client';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DynamicFormOnSubmit } from '@/modules/form/components/DynamicForm';
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

type Args = {
  definition: FormDefinition;
  clientId: string;
  enrollmentId: string;
  assessmentId?: string;
  navigateOnComplete?: boolean;
};

export function useAssessmentHandlers({
  definition,
  clientId,
  enrollmentId,
  assessmentId,
  navigateOnComplete,
}: Args) {
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

  const submitHandler: DynamicFormOnSubmit = useCallback(
    (values, hudValues, confirmed = false) => {
      if (!definition) return;
      setErrors([]);
      const input = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values,
        hudValues,
        confirmed,
      };
      console.debug('Submitting', input, confirmed);
      void submitAssessmentMutation({ variables: { input: { input } } });
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
      if (!definition) return;
      setErrors([]);
      const hudValues = transformSubmitValues({
        definition: definition.definition,
        values,
        limitFields: ['informationDate', 'Exit.exitDate'],
        autofillNulls: true,
      });
      const input = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values,
        hudValues,
      };
      console.debug('Saving', input);
      void saveAssessmentMutation({ variables: { input: { input } } });
    },
    [
      saveAssessmentMutation,
      assessmentId,
      definition,
      formDefinitionId,
      enrollmentId,
    ]
  );

  return {
    submitHandler,
    saveDraftHandler,
    mutationLoading: saveLoading || submitLoading,
    errors,
    apolloError: saveError || submitError,
  } as {
    submitHandler: DynamicFormOnSubmit;
    saveDraftHandler: (values: FormValues) => void;
    mutationLoading: boolean;
    errors: ValidationError[];
    apolloError?: ApolloError;
  };
}
