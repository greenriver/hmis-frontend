import { Box, Grid } from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import {
  debugFormValues,
  getInitialValues,
  getItemMap,
  LocalConstants,
  shouldEnableItem,
} from '../util/formUtil';

import FormNavigation, { FormNavigationProps } from './FormNavigation';

import { ApolloErrorAlert } from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import { STICKY_BAR_HEIGHT } from '@/components/layout/layoutConstants';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm, {
  DynamicFormOnSubmit,
  DynamicFormProps,
} from '@/modules/form/components/DynamicForm';
import {
  createInitialValuesFromRecord,
  transformSubmitValues,
} from '@/modules/form/util/formUtil';
import {
  FormInput,
  FormRole,
  ItemType,
  SubmitFormMutation,
  useGetFormDefinitionQuery,
  useSubmitFormMutation,
  ValidationError,
} from '@/types/gqlTypes';

export interface Props<RecordType>
  extends Omit<
    DynamicFormProps,
    | 'initialValues'
    | 'submitHandler'
    | 'errors'
    | 'loading'
    | 'onSubmit'
    | 'definition'
  > {
  formRole: FormRole;
  record?: RecordType;
  inputVariables?: Omit<
    FormInput,
    'confirmed' | 'formDefinitionId' | 'values' | 'hudValues' | 'recordId'
  >;
  localConstants?: LocalConstants;
  onCompleted: (data: RecordType) => void;
  title: ReactNode;
  navigationProps?: Omit<FormNavigationProps, 'items' | 'children'>;
  top?: number;
}

type AllowedTypes = NonNullable<
  NonNullable<SubmitFormMutation['submitForm']>['record']
>;

/**
 * Renders a form for creating or updating a record
 */
const EditRecord = <RecordType extends AllowedTypes>({
  formRole,
  record,
  onCompleted,
  title,
  navigationProps,
  inputVariables = {},
  localConstants = {},
  top = STICKY_BAR_HEIGHT,
  ...props
}: Props<RecordType>) => {
  const [errors, setErrors] = useState<ValidationError[] | undefined>();

  const {
    data,
    loading: definitionLoading,
    error: definitionError,
  } = useGetFormDefinitionQuery({
    variables: { role: formRole },
  });

  useScrollToHash(definitionLoading, top);

  const definition = useMemo(() => data?.getFormDefinition, [data]);
  const itemMap = useMemo(
    () => (definition ? getItemMap(definition.definition, false) : undefined),
    [definition]
  );

  const [submitForm, { loading: saveLoading, error: mutationError }] =
    useSubmitFormMutation({
      onCompleted: (data) => {
        const errors = data.submitForm?.errors || [];
        window.scrollTo(0, 0);
        if (errors.length > 0) {
          setErrors(errors);
        } else {
          const record = data.submitForm?.record || undefined;
          if (record) onCompleted(record as RecordType);
        }
      },
    });

  const initialValues = useMemo(() => {
    if (!itemMap || !definition) return {};
    const initialValuesFromDefinition = getInitialValues(
      definition.definition,
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
    (event, values, confirmed = false) => {
      if (!definition) return;
      if (debugFormValues(event, values, definition.definition)) return;

      const hudValues = transformSubmitValues({
        definition: definition.definition,
        values,
        autofillNotCollected: true,
        autofillNulls: true,
        keyByFieldName: true,
      });

      console.log('Submitting form values:', hudValues);
      const input = {
        formDefinitionId: definition.id,
        values,
        hudValues,
        recordId: record?.id,
        confirmed,
        ...inputVariables,
      };

      setErrors([]);
      void submitForm({ variables: { input: { input } } });
    },
    [definition, inputVariables, submitForm, record]
  );

  // Top-level items for the left nav (of >=3 groups)
  const leftNavItems = useMemo(() => {
    if (!definition || !itemMap) return false;

    let topLevelItems = definition.definition.item.filter(
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
        definition={definition.definition}
        onSubmit={submitHandler}
        initialValues={initialValues}
        loading={saveLoading}
        errors={errors}
        {...props}
        FormActionProps={{
          submitButtonText: 'Save Changes',
          ...props.FormActionProps,
        }}
        FormWarningDialogProps={{
          confirmText: 'Confirm Change',
          ...props.FormWarningDialogProps,
        }}
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
