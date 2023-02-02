import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Box, Grid } from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import {
  getInitialValues,
  getItemMap,
  LocalConstants,
  shouldEnableItem,
} from '../util/formUtil';

import FormNavigation, { FormNavigationProps } from './FormNavigation';

import { ApolloErrorAlert } from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm, {
  DynamicFormOnSubmit,
  Props as DynamicFormProps,
} from '@/modules/form/components/DynamicForm';
import { createInitialValuesFromRecord } from '@/modules/form/util/recordFormUtil';
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
  navigationProps?: Omit<FormNavigationProps, 'items' | 'children'>;
  top?: number;
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
  top = STICKY_BAR_HEIGHT,
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

  useScrollToHash(definitionLoading, top);

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
        window.scrollTo(0, 0);
        if (errors.length > 0) {
          setErrors(errors);
        } else {
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

  const submitHandler: DynamicFormOnSubmit = useCallback(
    (_values, hudValues, confirmed = false) => {
      if (!definition) return;
      console.log('Submitting form values:', hudValues);
      const input = {
        input: { ...hudValues, ...inputVariables },
        id: record?.id,
        confirmed: confirmable ? confirmed : undefined,
      };

      setErrors([]);
      void mutateFunction({ variables: { input } as QueryVariables });
    },
    [definition, inputVariables, mutateFunction, record, confirmable]
  );

  // Top-level items for the left nav (of >=3 groups)
  const leftNavItems = useMemo(() => {
    if (!definition || !itemMap) return false;

    let topLevelItems = definition.item.filter(
      (i) => i.type === ItemType.Group && !i.hidden
    );

    if (topLevelItems.length < 3) return false;

    // Remove disabled groups
    topLevelItems = topLevelItems.filter((item) =>
      shouldEnableItem(item, initialValues, itemMap)
    );
    if (topLevelItems.length < 3) return false;
    return topLevelItems;
  }, [itemMap, definition, initialValues]);

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
        {...props}
      />
      {mutationError && (
        <Box sx={{ mt: 3 }}>
          <ApolloErrorAlert error={mutationError} />
        </Box>
      )}
    </>
  );

  if (leftNavItems) {
    return (
      <>
        <Box
          sx={{
            backgroundColor: (theme) => theme.palette.background.default,
            zIndex: (theme) => theme.zIndex.appBar,
          }}
        >
          {title}
        </Box>
        <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
          <FormNavigation items={leftNavItems} top={top} {...navigationProps}>
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
