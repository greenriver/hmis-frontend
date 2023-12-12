import { TypedDocumentNode } from '@apollo/client';
import { RefObject } from 'react';
import { FormValues } from '../types';
import Loading from '@/components/elements/Loading';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { useDynamicFormHandlersForCustomMutation } from '@/modules/form/hooks/useDynamicFormHandlersForCustomMutation';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import useStaticFormDefinition from '@/modules/form/hooks/useStaticFormDefinition';
import { StaticFormRole, ValidationError } from '@/types/gqlTypes';

interface Props<TData, TVariables> {
  // Static form role
  role: StaticFormRole;
  // Initial values, if editing an existing record
  initialValues?: Record<string, any>;
  // Mutation document for submission
  mutationDocument: TypedDocumentNode<TData, TVariables>;
  // Get mutation variables from form values (keyed by fieldName)
  getVariables: (values: FormValues, confirmed?: boolean) => TVariables;
  // Get errors from mutation response
  getErrors: (data: TData) => ValidationError[];
  // Mutation completion callback (called regardless of success/error)
  onCompleted: (data: TData) => void;
  // Error element ref
  errorRef?: RefObject<HTMLDivElement>;
}

const StaticForm = <
  TData extends { __typename?: 'Mutation' },
  TVariables extends { input: { [key: string]: any } }
>({
  role,
  initialValues,
  ...props
}: Props<TData, TVariables>) => {
  const { formDefinition, itemMap } = useStaticFormDefinition(role);

  const initialFormValues = useInitialFormValues({
    record: initialValues,
    itemMap,
    definition: formDefinition?.definition,
    localConstants: {},
  });

  const { onSubmit, errors, submitLoading } =
    useDynamicFormHandlersForCustomMutation<TData, TVariables>({
      formDefinition,
      ...props,
    });

  if (!formDefinition) return <Loading />;

  return (
    <DynamicForm
      initialValues={initialFormValues}
      definition={formDefinition?.definition}
      onSubmit={onSubmit}
      errors={errors}
      loading={submitLoading}
    />
  );
};

export default StaticForm;
