import { ApolloError } from '@apollo/client';
import { useCallback, useState } from 'react';

import { DynamicFormOnSubmit } from '@/modules/form/components/DynamicForm';
import { debugFormValues, FormValues } from '@/modules/form/util/formUtil';
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
};

export function useAssessmentHandlers({
  definition,
  enrollmentId,
  assessmentId,
}: Args) {
  const formDefinitionId = definition.id;

  const [errors, setErrors] = useState<ValidationError[]>([]);

  const onCompleted = useCallback(
    (data: SubmitAssessmentMutation | SaveAssessmentMutation) => {
      let errs;
      if (data.hasOwnProperty('saveAssessment')) {
        errs = (data as SaveAssessmentMutation).saveAssessment?.errors || [];
      } else {
        errs =
          (data as SubmitAssessmentMutation).submitAssessment?.errors || [];
      }

      if (errs.length > 0) {
        window.scrollTo(0, 0);
        setErrors(errs);
        return;
      }
      setErrors([]);
    },
    [setErrors]
  );

  const onError = useCallback(() => window.scrollTo(0, 0), []);
  const [saveAssessmentMutation, { loading: saveLoading, error: saveError }] =
    useSaveAssessmentMutation({ onError });

  const [
    submitAssessmentMutation,
    { loading: submitLoading, error: submitError },
  ] = useSubmitAssessmentMutation({ onError });

  const submitHandler: DynamicFormOnSubmit = useCallback(
    (event, values, confirmed = false, onSuccessCallback = null) => {
      if (!definition) return;
      if (debugFormValues(event, values, definition.definition)) return;

      const hudValues = transformSubmitValues({
        definition: definition.definition,
        values,
        autofillNotCollected: true,
        autofillNulls: true,
      });

      const input = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values,
        hudValues,
        confirmed,
      };
      console.debug('Submitting', input, confirmed);
      void submitAssessmentMutation({
        variables: { input: { input } },
        onCompleted: (data) => {
          onCompleted(data);
          if (data.submitAssessment?.assessment && onSuccessCallback) {
            onSuccessCallback();
          }
        },
      });
    },
    [
      submitAssessmentMutation,
      assessmentId,
      definition,
      formDefinitionId,
      enrollmentId,
      onCompleted,
    ]
  );

  const saveDraftHandler = useCallback(
    (values: FormValues, onSuccessCallback: VoidFunction) => {
      if (!definition) return;
      const hudValues = transformSubmitValues({
        definition: definition.definition,
        values,
        assessmentDateOnly: true,
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
      void saveAssessmentMutation({
        variables: { input: { input } },
        onCompleted: (data) => {
          onCompleted(data);
          if (data.saveAssessment?.assessment && onSuccessCallback) {
            onSuccessCallback();
          }
        },
      });
    },
    [
      saveAssessmentMutation,
      assessmentId,
      definition,
      formDefinitionId,
      enrollmentId,
      onCompleted,
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
