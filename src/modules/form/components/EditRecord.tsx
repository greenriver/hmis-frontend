import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Box, Grid } from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import {
  CONFIRM_ERROR_TYPE,
  getInitialValues,
  getItemMap,
  LocalConstants,
} from '../util/formUtil';

import FormNavigation, { FormNavigationProps } from './FormNavigation';

import { ApolloErrorAlert } from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm, {
  Props as DynamicFormProps,
} from '@/modules/form/components/DynamicForm';
import {
  createInitialValuesFromRecord,
  transformSubmitValues,
} from '@/modules/form/util/recordFormUtil';
import {
  FormDefinitionJson,
  ItemType,
  useGetFormDefinitionByIdentifierQuery,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props<RecordType, Query, QueryVariables>
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
  localConstants?: LocalConstants;
  onCompleted: (data: Query) => void;
  getErrors: (data: Query) => ValidationError[] | undefined;
  confirmable?: boolean; // whether mutation supports `confirmed` for warning confirmation on submit
  title: ReactNode;
  navigationProps?: Omit<FormNavigationProps, 'definition' | 'children'>;
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
  title,
  navigationProps,
  confirmable = false,
  inputVariables = {},
  localConstants = {},
  ...props
}: Props<RecordType, Query, QueryVariables>) => {
  const [errors, setErrors] = useState<ValidationError[] | undefined>();
  const [warnings, setWarnings] = useState<ValidationError[] | undefined>();

  const {
    data,
    loading: definitionLoading,
    error: definitionError,
  } = useGetFormDefinitionByIdentifierQuery({
    variables: { identifier: definitionIdentifier },
  });

  useScrollToHash(definitionLoading, 102);

  const definition: FormDefinitionJson | undefined = useMemo(
    () => data?.formDefinition?.definition,
    [data]
  );
  const itemMap = useMemo(
    () => (definition ? getItemMap(definition, false) : undefined),
    [definition]
  );

  const [mutateFunction, { loading: saveLoading, error: mutationError }] =
    useMutation<Query, QueryVariables>(queryDocument, {
      onCompleted: (data) => {
        const errors = getErrors(data) || [];

        if (errors.length > 0) {
          const warnings = errors.filter((e) => e.type === CONFIRM_ERROR_TYPE);
          const validationErrors = errors.filter(
            (e) => e.type !== CONFIRM_ERROR_TYPE
          );
          if (validationErrors.length > 0) window.scrollTo(0, 0);
          setWarnings(warnings);
          setErrors(validationErrors);
        } else {
          window.scrollTo(0, 0);
          onCompleted(data);
        }
      },
    });

  const initialValues = useMemo(() => {
    if (!itemMap || !definition) return {};
    const initialValuesFromDefinition = getInitialValues(
      definition,
      localConstants
    );
    if (!record) return initialValuesFromDefinition;

    const initialValuesFromRecord = createInitialValuesFromRecord(
      itemMap,
      record
    );
    const values = {
      ...initialValuesFromDefinition,
      ...initialValuesFromRecord,
    };
    console.log('Initial form values:', values, 'from', record);
    return values;
  }, [record, definition, itemMap, localConstants]);

  const submitHandler = useCallback(
    (values: Record<string, any>, confirmed = false) => {
      if (!definition) return;
      // Transform values into client input query variables
      const inputValues = transformSubmitValues({
        definition,
        values,
        autofillNotCollected: true,
        autofillNulls: true,
        autofillBooleans: false,
      });
      console.log('Submitted form values:', inputValues);

      const input = {
        input: { ...inputValues, ...inputVariables },
        id: record?.id,
        confirmed: confirmable ? confirmed : undefined,
      };

      setWarnings([]);
      setErrors([]);
      void mutateFunction({ variables: { input } as QueryVariables });
    },
    [definition, inputVariables, mutateFunction, record, confirmable]
  );

  const leftNav = useMemo(
    () =>
      definition &&
      definition.item.filter((i) => i.type === ItemType.Group).length >= 3,
    [definition]
  );

  if (definitionLoading) return <Loading />;
  if (definitionError) console.error(definitionError);
  if (!definition) throw Error('Definition not found');

  const form = (
    <>
      <DynamicForm
        definition={definition}
        onSubmit={submitHandler}
        submitButtonText='Save Changes'
        discardButtonText='Discard'
        initialValues={initialValues}
        loading={saveLoading}
        errors={errors}
        warnings={warnings}
        {...props}
      />
      {mutationError && (
        <Box sx={{ mt: 3 }}>
          <ApolloErrorAlert error={mutationError} />
        </Box>
      )}
    </>
  );

  if (leftNav) {
    return (
      <>
        <Box
          sx={{
            position: 'sticky',
            top: 10,
            backgroundColor: (theme) => theme.palette.background.default,
            zIndex: (theme) => theme.zIndex.appBar,
            // hack to add 15px of space on top of crumbs when scrolled to the top
            '&:before': {
              content: '""',
              backgroundColor: (theme) => theme.palette.background.default,
              position: 'absolute',
              height: '15px',
              mt: '-14px',
              width: '100%',
            },
          }}
        >
          {title}
        </Box>
        <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
          <FormNavigation definition={definition} {...navigationProps}>
            {form}
          </FormNavigation>
        </Grid>
      </>
    );
  }

  return (
    <>
      {title}
      <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
        <Grid item xs>
          {form}
        </Grid>
      </Grid>
    </>
  );
};

export default EditRecord;
