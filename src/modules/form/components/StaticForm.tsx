import { TypedDocumentNode } from '@apollo/client';
import { Ref, RefObject, useMemo } from 'react';
import { FormValues, LocalConstants } from '../types';
import { AlwaysPresentLocalConstants } from '../util/formUtil';
import Loading from '@/components/elements/Loading';
import DynamicForm, {
  DynamicFormProps,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
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
  // Form element ref
  formRef?: Ref<DynamicFormRef>;
  // Error element ref
  errorRef?: RefObject<HTMLDivElement>;
  // Local constants for Form Definition
  localConstants?: LocalConstants;
  // Props to pass to DynamicForm
  DynamicFormProps?: Omit<
    DynamicFormProps,
    'definition' | 'onSubmit' | 'errors'
  >;
}

const StaticForm = <
  TData extends { __typename?: 'Mutation' },
  TVariables extends { input: { [key: string]: any } },
>({
  role,
  initialValues,
  localConstants: localConstantsProp,
  mutationDocument,
  getVariables,
  getErrors,
  onCompleted,
  errorRef,
  formRef,
  DynamicFormProps,
}: Props<TData, TVariables>) => {
  const { formDefinition, itemMap } = useStaticFormDefinition(role);

  const localConstants: LocalConstants = useMemo(
    () => ({ ...AlwaysPresentLocalConstants, ...localConstantsProp }),
    [localConstantsProp]
  );

  const initialFormValues = useInitialFormValues({
    record: initialValues,
    itemMap,
    definition: formDefinition?.definition,
    localConstants,
  });

  const { onSubmit, errors, submitLoading } =
    useDynamicFormHandlersForCustomMutation<TData, TVariables>({
      formDefinition,
      mutationDocument,
      getVariables,
      getErrors,
      onCompleted,
      errorRef,
    });

  if (!formDefinition) return <Loading />;

  return (
    <DynamicForm
      ref={formRef}
      errorRef={errorRef}
      initialValues={initialFormValues}
      definition={formDefinition?.definition}
      onSubmit={onSubmit}
      errors={errors}
      loading={submitLoading}
      localConstants={localConstants}
      {...DynamicFormProps}
    />
  );
};

export default StaticForm;
