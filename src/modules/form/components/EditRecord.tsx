import { TypedDocumentNode, useMutation } from '@apollo/client';
import { useCallback, useMemo, useState } from 'react';

import DynamicForm, {
  Props as DynamicFormProps,
} from '@/modules/form/components/DynamicForm';
import {
  createInitialValues,
  transformSubmitValues,
} from '@/modules/form/formUtil';
import { ValidationError } from '@/types/gqlTypes';

interface Props<RecordType, Query, QueryVariables>
  extends Omit<
    DynamicFormProps,
    'initialValues' | 'submitHandler' | 'errors' | 'loading' | 'onSubmit'
  > {
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
  definition,
  record,
  queryDocument,
  getErrors,
  onCompleted,
  inputVariables = {},
  ...props
}: Props<RecordType, Query, QueryVariables>) => {
  const [errors, setErrors] = useState<ValidationError[] | undefined>();
  const [mutateFunction, { loading, error }] = useMutation<
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
    if (!record) return {};
    return createInitialValues(definition, record);
  }, [record, definition]);

  const submitHandler = useCallback(
    (values: Record<string, any>) => {
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

  if (error) console.error(error); // FIXME handle error on form submission

  return (
    <DynamicForm
      definition={definition}
      onSubmit={submitHandler}
      submitButtonText='Save Changes'
      discardButtonText='Discard'
      initialValues={initialValues}
      loading={loading}
      errors={errors}
      {...props}
    />
  );
};
export default EditRecord;
