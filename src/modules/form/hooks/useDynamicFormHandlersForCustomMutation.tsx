import { TypedDocumentNode, useMutation } from '@apollo/client';
import { RefObject, useCallback, useState } from 'react';

import { DynamicFormOnSubmit } from '../components/DynamicForm';
import { FormValues } from '../types';

import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import {
  FormDefinitionFieldsFragment,
  ValidationError,
} from '@/types/gqlTypes';

export interface GenericFormHandlerArgs<TData, TVariables> {
  mutationDocument: TypedDocumentNode<TData, TVariables>;
  getErrors: (data: TData) => ValidationError[];
  getVariables: (values: FormValues, confirmed?: boolean) => TVariables;
  onCompleted: (data: TData) => void;
  formDefinition?: FormDefinitionFieldsFragment;
  errorRef?: RefObject<HTMLDivElement>;
}

// Similar to useDynamicFormHandlersForRecord, but instead of assuming
// usage of SubmitForm, it uses the specified mutation.
export function useDynamicFormHandlersForCustomMutation<
  TData extends { __typename?: 'Mutation' },
  TVariables extends { input: { [key: string]: any } },
>({
  mutationDocument,
  getErrors,
  getVariables,
  onCompleted,
  formDefinition,
  errorRef,
}: GenericFormHandlerArgs<TData, TVariables>) {
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const [mutateFunction, { data, loading: submitLoading }] = useMutation<
    TData,
    TVariables
  >(mutationDocument, {
    onCompleted: (data) => {
      const errors = data ? getErrors(data) : [];
      if (errorRef) {
        errorRef.current?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
      if (errors.length > 0) {
        setErrors(partitionValidations(errors));
      }

      onCompleted(data);
    },
    onError: (apolloError) => {
      setErrors({ ...emptyErrorState, apolloError });
      if (errorRef) {
        errorRef.current?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    },
  });

  const onSubmit: DynamicFormOnSubmit = useCallback(
    ({ valuesByFieldName, confirmed = false }) => {
      if (!formDefinition) return;

      const variables = getVariables(valuesByFieldName, confirmed);
      setErrors(emptyErrorState);
      void mutateFunction({ variables });
    },
    [formDefinition, mutateFunction, getVariables]
  );

  return {
    onSubmit, // Handler to pass to DynamicForm
    data, // Raw data response from mutation
    submitLoading, // Mutation loading state
    errors, // ErrorState
    setErrors,
  };
}
