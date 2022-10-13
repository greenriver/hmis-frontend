import { TypedDocumentNode, useMutation } from '@apollo/client';
import { useMemo, useState } from 'react';

import DynamicForm from '@/modules/form/components/DynamicForm';
import {
  createInitialValues,
  transformSubmitValues,
} from '@/modules/form/formUtil';
import { FormDefinition } from '@/modules/form/types';
import { ValidationError } from '@/types/gqlTypes';

interface Props<RecordType, Query, QueryVariables> {
  formDefinition: FormDefinition;
  mappingKey: string;
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
  formDefinition,
  mappingKey,
  record,
  queryDocument,
  getErrors,
  onCompleted,
  inputVariables = {},
}: Props<RecordType, Query, QueryVariables>) => {
  const [errors, setErrors] = useState<ValidationError[] | undefined>();
  const [mutateFunction, { loading, error }] = useMutation<
    Query,
    QueryVariables
  >(queryDocument, {
    onCompleted: (data) => {
      const errors = getErrors(data);
      setErrors(errors);
      onCompleted(data);
    },
  });

  const initialValues = useMemo(() => {
    if (!record) return {};
    return createInitialValues(formDefinition, record, mappingKey);
  }, [record, mappingKey, formDefinition]);

  const submitHandler = (values: Record<string, any>) => {
    // Transform values into client input query variables
    const inputValues = transformSubmitValues(
      formDefinition,
      values,
      mappingKey,
      true,
      true
    );
    console.log(JSON.stringify(inputValues, null, 2));

    const input = {
      input: { ...inputValues, ...inputVariables },
      id: record?.id,
    };

    void mutateFunction({ variables: { input } as QueryVariables });
  };

  if (error) console.error(error); // FIXME handle error on form submission

  return (
    <DynamicForm
      definition={formDefinition}
      onSubmit={submitHandler}
      submitButtonText='Save Changes'
      discardButtonText='Discard'
      initialValues={initialValues}
      loading={loading}
      errors={errors}
    />
  );
};
export default EditRecord;
