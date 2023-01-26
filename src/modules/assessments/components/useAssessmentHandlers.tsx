import { ApolloError } from '@apollo/client';
import { useCallback, useState } from 'react';

import { FormValues } from '@/modules/form/util/formUtil';
import { transformSubmitValues } from '@/modules/form/util/recordFormUtil';
import {
  FormDefinition,
  SaveAssessmentMutation,
  SubmitAssessmentMutation,
  useSaveAssessmentMutation,
  useSubmitAssessmentMutation,
  ValidationError,
} from '@/types/gqlTypes';

type Args = {
  definition: FormDefinition;
  enrollmentId: string;
  assessmentId?: string;
  onSuccess?: VoidFunction;
};

export function useAssessmentHandlers({
  definition,
  enrollmentId,
  assessmentId,
  onSuccess,
}: Args) {
  const formDefinitionId = definition.id;

  const [errors, setErrors] = useState<ValidationError[] | undefined>();

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

      if (onSuccess) onSuccess();
    },
    [setErrors, onSuccess]
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
