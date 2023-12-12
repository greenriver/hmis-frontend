import { SubmitFormAllowedTypes } from '../types';
import Loading from '@/components/elements/Loading';
import DynamicForm from '@/modules/form/components/DynamicForm';
import {
  GenericFormHandlerArgs,
  useDynamicFormHandlersForCustomMutation,
} from '@/modules/form/hooks/useDynamicFormHandlersForCustomMutation';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import useStaticFormDefinition from '@/modules/form/hooks/useStaticFormDefinition';
import { Mutation, StaticFormRole } from '@/types/gqlTypes';

interface Props<TData, TVariables>
  extends Omit<GenericFormHandlerArgs<TData, TVariables>, 'formDefinition'> {
  role: StaticFormRole;
  id?: string;
  initialValues?: Record<string, any>;
}

const StaticForm = <
  TData extends Mutation[keyof Mutation],
  TVariables extends { input: { [key: string]: any } }
>({
  role,
  id,
  initialValues,
  ...args
}: Props<TData, TVariables>) => {
  const { formDefinition, itemMap } = useStaticFormDefinition(role);

  const initialFormValues = useInitialFormValues({
    record: initialValues as SubmitFormAllowedTypes, // FIXME
    itemMap,
    definition: formDefinition?.definition,
    localConstants: {},
  });

  const { onSubmit, errors, submitLoading } =
    useDynamicFormHandlersForCustomMutation<TData, TVariables>({
      formDefinition,
      ...args,
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
