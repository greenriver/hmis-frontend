import { ApolloError } from '@apollo/client';
import { useCallback, useState } from 'react';

import { DynamicFormOnSubmit } from '@/modules/form/components/DynamicForm';
import { FormValues } from '@/modules/form/types';
import {
  debugFormValues,
  transformSubmitValues,
} from '@/modules/form/util/formUtil';
import {
  FormDefinition,
  FormDefinitionJson,
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

export const createValuesForSubmit = (
  values: FormValues,
  definition: FormDefinitionJson
) => transformSubmitValues({ definition, values });

export const createHudValuesForSubmit = (
  values: FormValues,
  definition: FormDefinitionJson
) =>
  transformSubmitValues({
    definition,
    values,
    keyByFieldName: true,
    includeMissingKeys: 'AS_HIDDEN',
  });

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
    ({ event, values, confirmed = false, onSuccess }) => {
      if (!definition) return;
      if (
        event &&
        debugFormValues(
          event,
          values,
          definition.definition,
          createValuesForSubmit,
          createHudValuesForSubmit
        )
      )
        return;

      const input = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values: createValuesForSubmit(values, definition.definition),
        hudValues: createHudValuesForSubmit(values, definition.definition),
        confirmed,
      };
      console.debug('Submitting', input, confirmed);
      void submitAssessmentMutation({
        variables: { input: { input } },
        onCompleted: (data) => {
          onCompleted(data);
          if (data.submitAssessment?.assessment && onSuccess) {
            onSuccess();
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

      const input = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values: createValuesForSubmit(values, definition.definition),
        hudValues: createHudValuesForSubmit(values, definition.definition),
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
