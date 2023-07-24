import { useCallback, useMemo, useState } from 'react';

import { DynamicFormOnSubmit } from '../components/DynamicForm';
import { LocalConstants, SubmitFormAllowedTypes } from '../types';
import {
  createHudValuesForSubmit,
  createValuesForSubmit,
  debugFormValues,
  getItemMap,
} from '../util/formUtil';

import useInitialFormValues from './useInitialFormValues';

import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import {
  FormDefinitionFieldsFragment,
  FormInput,
  useSubmitFormMutation,
} from '@/types/gqlTypes';

type SubmitFormInputVariables = Omit<
  FormInput,
  'confirmed' | 'formDefinitionId' | 'values' | 'hudValues' | 'recordId'
>;

export interface DynamicFormHandlerArgs<T> {
  // formRole: FormRole;
  formDefinition?: FormDefinitionFieldsFragment;
  record?: T;
  onCompleted?: (data: T) => void;
  localConstants?: LocalConstants;
  inputVariables?: SubmitFormInputVariables;
}

export function useDynamicFormHandlersForRecord<
  T extends SubmitFormAllowedTypes
>({
  formDefinition,
  record,
  onCompleted,
  inputVariables,
  localConstants,
}: DynamicFormHandlerArgs<T>) {
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const itemMap = useMemo(
    () => formDefinition && getItemMap(formDefinition.definition),
    [formDefinition]
  );
  const [submitForm, { loading: submitLoading }] = useSubmitFormMutation({
    onCompleted: (data) => {
      const errors = data.submitForm?.errors || [];
      window.scrollTo(0, 0);
      if (errors.length > 0) {
        setErrors(partitionValidations(errors));
      } else {
        const record = data.submitForm?.record || undefined;
        if (record && onCompleted) onCompleted(record as T);
      }
    },
    onError: (apolloError) => {
      setErrors({ ...emptyErrorState, apolloError });
      window.scrollTo(0, 0);
    },
  });

  const initialValues = useInitialFormValues({
    record,
    itemMap,
    definition: formDefinition?.definition,
    localConstants,
  });

  const onSubmit: DynamicFormOnSubmit = useCallback(
    ({ event, values, confirmed = false }) => {
      if (!formDefinition) return;
      if (
        event &&
        debugFormValues(
          event,
          values,
          formDefinition.definition,
          createValuesForSubmit,
          createHudValuesForSubmit
        )
      )
        return;

      const input = {
        formDefinitionId: formDefinition.id,
        values: createValuesForSubmit(values, formDefinition.definition),
        hudValues: createHudValuesForSubmit(values, formDefinition.definition),
        recordId: record?.id,
        confirmed,
        ...inputVariables,
      };

      setErrors(emptyErrorState);
      void submitForm({ variables: { input: { input } } });
    },
    [formDefinition, inputVariables, submitForm, record]
  );

  return {
    itemMap,
    initialValues,
    errors,
    onSubmit,
    submitLoading,
    setErrors,
  };
}
