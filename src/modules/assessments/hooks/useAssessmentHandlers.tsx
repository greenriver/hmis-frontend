import { ApolloError } from '@apollo/client';
import { useCallback, useState } from 'react';

import {
  emptyErrorState,
  ErrorState,
  hasAnyValue,
  hasErrors,
  hasOnlyWarnings,
  partitionValidations,
} from '@/modules/errors/util';
import { DynamicFormOnSubmit } from '@/modules/form/components/DynamicForm';
import { FormValues } from '@/modules/form/types';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import {
  AssessmentInput,
  FormDefinitionFieldsFragment,
  FormDefinitionJson,
  SaveAssessmentMutation,
  SubmitAssessmentMutation,
  useSaveAssessmentMutation,
  useSubmitAssessmentMutation,
} from '@/types/gqlTypes';

export type AssessmentResponseStatus =
  | 'saved'
  | 'submitted'
  | 'error'
  | 'warning';

type Args = {
  definition?: FormDefinitionFieldsFragment;
  enrollmentId: string;
  assessmentId?: string;
  assessmentLockVersion?: number;
  onCompletedMutation?: (
    status: AssessmentResponseStatus,
    data?: SubmitAssessmentMutation | SaveAssessmentMutation
  ) => void;
};

function isSaveMutation(
  data: SubmitAssessmentMutation | SaveAssessmentMutation
): data is SaveAssessmentMutation {
  return data && data.hasOwnProperty('saveAssessment');
}

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
  assessmentLockVersion,
  onCompletedMutation = () => null,
}: Args) {
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const onCompleted = useCallback(
    (data: SubmitAssessmentMutation | SaveAssessmentMutation) => {
      let errs;
      if (isSaveMutation(data)) {
        errs = data.saveAssessment?.errors || [];
      } else {
        errs = data.submitAssessment?.errors || [];
      }
      const errorState = partitionValidations(errs || []);

      let status: AssessmentResponseStatus;
      if (hasErrors(errorState)) {
        status = 'error';
      } else if (hasOnlyWarnings(errorState)) {
        status = 'warning';
      } else if (isSaveMutation(data)) {
        status = 'saved';
      } else {
        status = 'submitted';
      }

      if (hasAnyValue(errorState)) {
        window.scrollTo(0, 0); // scroll to top to view errors
        setErrors(errorState); // update error state
        onCompletedMutation(status, data); // callback
      } else {
        setErrors(emptyErrorState); // clear error state
        onCompletedMutation(status, data); // callback
      }
    },
    [onCompletedMutation]
  );

  // Handle server error
  const onError = useCallback(
    (apolloError: ApolloError) => {
      window.scrollTo(0, 0);
      setErrors({ ...emptyErrorState, apolloError });
      onCompletedMutation('error');
    },
    [onCompletedMutation]
  );

  const [saveAssessmentMutation, { loading: saveLoading }] =
    useSaveAssessmentMutation({ onError });

  const [submitAssessmentMutation, { loading: submitLoading }] =
    useSubmitAssessmentMutation({ onError });

  // wrap in form definition id becuse we need it to submit assessments,
  // but its down in the AssessmentForm. spaghetti
  const submitHandler: (formDefinitionId: string) => DynamicFormOnSubmit =
    useCallback(
      (formDefinitionId: string) =>
        ({ values, hudValues, confirmed = false, onSuccess }) => {
          const input = {
            assessmentId,
            enrollmentId,
            formDefinitionId,
            values,
            hudValues,
            confirmed,
          };
          void submitAssessmentMutation({
            variables: { input: { input, assessmentLockVersion } },
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
        assessmentLockVersion,

        enrollmentId,
        onCompleted,
      ]
    );

  const saveDraftHandler = useCallback(
    (values: FormValues, onSuccessCallback?: VoidFunction) => {
      if (!definition) return;

      const input: AssessmentInput = {
        assessmentId,
        enrollmentId,
        formDefinitionId: definition.id, // ok because it shouldn't have changed in AssessmentForm
        values: createValuesForSubmit(values, definition.definition),
        hudValues: createHudValuesForSubmit(values, definition.definition),
      };
      void saveAssessmentMutation({
        variables: { input: { input, assessmentLockVersion } },
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
      assessmentLockVersion,
      definition,
      enrollmentId,
      onCompleted,
    ]
  );

  return {
    submitHandler,
    saveDraftHandler,
    mutationLoading: saveLoading || submitLoading,
    errors,
  } as const;
}
