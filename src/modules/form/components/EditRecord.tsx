import { TypedDocumentNode, useMutation } from '@apollo/client';
import { useCallback, useMemo, useState } from 'react';

import Loading from '@/components/elements/Loading';
import DynamicForm, {
  Props as DynamicFormProps,
} from '@/modules/form/components/DynamicForm';
import {
  createInitialValuesFromRecord,
  transformSubmitValues,
} from '@/modules/form/formUtil';
import {
  FormDefinitionJson,
  useGetFormDefinitionByIdentifierQuery,
  ValidationError,
} from '@/types/gqlTypes';

interface Props<RecordType, Query, QueryVariables>
  extends Omit<
    DynamicFormProps,
    | 'initialValues'
    | 'submitHandler'
    | 'errors'
    | 'loading'
    | 'onSubmit'
    | 'definition'
  > {
  definitionIdentifier: string;
  record?: RecordType;
  queryDocument: TypedDocumentNode<Query, QueryVariables>;
  inputVariables?: Record<string, any>;
  onCompleted: (data: Query) => void;
  getErrors: (data: Query) => ValidationError[] | undefined;
}

/**
 * Renders a form for creating or updating a record of type RecordType.
 */
const EditRecord = <
  RecordType extends { id: string },
  Query extends Record<string, string | Record<string, unknown> | null>,
  QueryVariables extends { input: unknown }
>({
  definitionIdentifier,
  record,
  queryDocument,
  getErrors,
  onCompleted,
  inputVariables = {},
  ...props
}: Props<RecordType, Query, QueryVariables>) => {
  const [errors, setErrors] = useState<ValidationError[] | undefined>();

  const {
    data,
    loading: definitionLoading,
    error: definitionError,
  } = useGetFormDefinitionByIdentifierQuery({
    variables: { identifier: definitionIdentifier },
  });
  const definition: FormDefinitionJson | undefined = useMemo(
    () => data?.formDefinition?.definition,
    [data]
  );

  const [mutateFunction, { loading: saveLoading, error }] = useMutation<
    Query,
    QueryVariables
  >(queryDocument, {
    onCompleted: (data) => {
      const errors = getErrors(data);
      if ((errors || []).length > 0) {
        window.scrollTo(0, 0);
        setErrors(errors);
      } else {
        onCompleted(data);
      }
    },
  });

  const initialValues = useMemo(() => {
    if (!record || !definition) return {};
    return createInitialValuesFromRecord(definition, record);
  }, [record, definition]);

  const submitHandler = useCallback(
    (values: Record<string, any>) => {
      if (!definition) return;
      // Transform values into client input query variables
      const inputValues = transformSubmitValues({
        definition,
        values,
        autofillNotCollected: true,
        autofillNulls: true,
        autofillBooleans: true,
      });
      console.log(JSON.stringify(inputValues, null, 2));

      const input = {
        input: { ...inputValues, ...inputVariables },
        id: record?.id,
      };

      void mutateFunction({ variables: { input } as QueryVariables });
    },
    [definition, inputVariables, mutateFunction, record]
  );

  if (definitionLoading) return <Loading />;
  if (error) console.error(error); // FIXME handle error on form submission
  if (definitionError) console.error(definitionError);
  if (!definition) throw Error('Definition not found');

  return (
    <DynamicForm
      definition={definition}
      onSubmit={submitHandler}
      submitButtonText='Save Changes'
      discardButtonText='Discard'
      initialValues={initialValues}
      loading={saveLoading}
      errors={errors}
      {...props}
    />
  );
};
export default EditRecord;
