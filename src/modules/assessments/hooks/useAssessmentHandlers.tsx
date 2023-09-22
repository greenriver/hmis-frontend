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
  AssessmentInput,
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
  assessmentLockVersion?: number;
  onSuccessfulSubmit?: (assessment: AssessmentFieldsFragment) => void;
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
  assessmentLockVersion,
  onSuccessfulSubmit = () => null,
}: Args) {
  const formDefinitionId = definition.id;

  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

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
        setErrors(partitionValidations(errs));
        return;
      }
      setErrors(emptyErrorState);
    },
    [setErrors]
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
        variables: { input: { input, assessmentLockVersion } },
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
      assessmentLockVersion,
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

      const input: AssessmentInput = {
        assessmentId,
        enrollmentId,
        formDefinitionId,
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
