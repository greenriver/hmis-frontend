import { ApolloError } from '@apollo/client';
import { useCallback, useState } from 'react';

import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import { DynamicFormOnSubmit } from '@/modules/form/components/DynamicForm';
import { FormValues } from '@/modules/form/types';
import {
  debugFormValues,
  transformSubmitValues,
} from '@/modules/form/util/formUtil';
import {
  AssessmentFieldsFragment,
  FormDefinition,
  FormDefinitionJson,
  SaveAssessmentMutation,
  SubmitAssessmentMutation,
  useSaveAssessmentMutation,
  useSubmitAssessmentMutation,
} from '@/types/gqlTypes';

type Args = {
  definition: FormDefinition;
  enrollmentId: string;
  assessmentId?: string;
  onSuccessfulSubmit?: (assessment: AssessmentFieldsFragment) => void;
  onCompleted?: (
    data: SubmitAssessmentMutation | SaveAssessmentMutation
  ) => any;
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

export const getErrorsFromMutationResult = (
  data: SubmitAssessmentMutation | SaveAssessmentMutation
) => {
  let errs;
  if (data.hasOwnProperty('saveAssessment')) {
    errs = (data as SaveAssessmentMutation).saveAssessment?.errors || [];
  } else {
    errs = (data as SubmitAssessmentMutation).submitAssessment?.errors || [];
  }
  return errs;
};

export function useAssessmentHandlers({
  definition,
  enrollmentId,
  assessmentId,
  onSuccessfulSubmit = () => null,
  onCompleted: onCompletedProp,
}: Args) {
  const formDefinitionId = definition.id;

  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const onCompleted = useCallback(
    (data: SubmitAssessmentMutation | SaveAssessmentMutation) => {
      if (onCompletedProp) onCompletedProp(data);

      const errs = getErrorsFromMutationResult(data);

      if (errs.length > 0) {
        window.scrollTo(0, 0);
        setErrors(partitionValidations(errs));
        return;
      }
      setErrors(emptyErrorState);
    },
    [setErrors, onCompletedProp]
  );

  const onError = useCallback((apolloError: ApolloError) => {
    window.scrollTo(0, 0);
    setErrors({ ...emptyErrorState, apolloError });
  }, []);

  const [saveAssessmentMutation, { loading: saveLoading }] =
    useSaveAssessmentMutation({ onError });

  const [submitAssessmentMutation, { loading: submitLoading }] =
    useSubmitAssessmentMutation({ onError });

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
      void submitAssessmentMutation({
        variables: { input: { input } },
        onCompleted: (data) => {
          onCompleted(data);
          if (data.submitAssessment?.assessment && onSuccess) {
            onSuccess();
            onSuccessfulSubmit(data.submitAssessment?.assessment);
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
      onSuccessfulSubmit,
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
  } as {
    submitHandler: DynamicFormOnSubmit;
    saveDraftHandler: (values: FormValues) => void;
    mutationLoading: boolean;
    errors: ErrorState;
  };
}
