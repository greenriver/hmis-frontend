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
import {
  DynamicFormOnSaveDraft,
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import {
  AssessmentInput,
  FormDefinitionFieldsFragment,
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

export function useAssessmentHandlers({
  definition,
  enrollmentId,
  assessmentId,
  assessmentLockVersion,
  onCompletedMutation = () => null,
}: Args) {
  const formDefinitionId = definition?.id;

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

  const submitHandler: DynamicFormOnSubmit = useCallback(
    ({ valuesByLinkId, valuesByFieldName, confirmed = false, onSuccess }) => {
      if (!definition || !formDefinitionId) return;

      const input = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values: valuesByLinkId,
        hudValues: valuesByFieldName,
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
      definition,
      formDefinitionId,
      enrollmentId,
      onCompleted,
    ]
  );

  const saveDraftHandler: DynamicFormOnSaveDraft = useCallback(
    ({ valuesByLinkId, valuesByFieldName, onSuccess }) => {
      if (!definition || !formDefinitionId) return;

      const input: AssessmentInput = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
        values: valuesByLinkId,
        hudValues: valuesByFieldName,
      };
      void saveAssessmentMutation({
        variables: { input: { input, assessmentLockVersion } },
        onCompleted: (data) => {
          onCompleted(data);
          if (data.saveAssessment?.assessment && onSuccess) {
            onSuccess();
          }
        },
      });
    },
    [
      saveAssessmentMutation,
      assessmentId,
      assessmentLockVersion,
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
  } as const;
}
