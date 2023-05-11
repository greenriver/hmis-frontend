import { Box, Grid } from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import useFormDefinition from '../hooks/useFormDefinition';
import { LocalConstants } from '../types';
import {
  createHudValuesForSubmit,
  createValuesForSubmit,
  debugFormValues,
  getInitialValues,
  shouldEnableItem,
} from '../util/formUtil';

import FormNavigation, { FormNavigationProps } from './FormNavigation';

import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import NotFound from '@/components/pages/NotFound';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
  DynamicFormProps,
} from '@/modules/form/components/DynamicForm';
import { createInitialValuesFromRecord } from '@/modules/form/util/formUtil';
import {
  FormInput,
  FormRole,
  ItemType,
  SubmitFormMutation,
  useSubmitFormMutation,
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
  FormNavigationProps?: Omit<FormNavigationProps, 'items' | 'children'>;
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
  FormNavigationProps,
  inputVariables = {},
  localConstants = {},
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
  ...props
}: Props<RecordType>) => {
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const {
    formDefinition,
    itemMap,
    loading: definitionLoading,
  } = useFormDefinition(formRole);

  useScrollToHash(definitionLoading, top);

  const [submitForm, { loading: saveLoading }] = useSubmitFormMutation({
    onCompleted: (data) => {
      const errors = data.submitForm?.errors || [];
      window.scrollTo(0, 0);
      if (errors.length > 0) {
        setErrors(partitionValidations(errors));
      } else {
        const record = data.submitForm?.record || undefined;
        if (record) onCompleted(record as RecordType);
      }
    },
    onError: (apolloError) => {
      setErrors({ ...emptyErrorState, apolloError });
      window.scrollTo(0, 0);
    },
  });

  const initialValues = useMemo(() => {
    if (!itemMap || !formDefinition) return {};
    const initialValuesFromDefinition = getInitialValues(
      formDefinition.definition,
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
    console.debug('Initial form values:', values, 'from', record);
    return values;
  }, [record, formDefinition, itemMap, localConstants]);

  const submitHandler: DynamicFormOnSubmit = useCallback(
    ({ event, values, confirmed = false }) => {
      if (!formDefinition) return;
      if (
        event &&
        debugFormValues(
          event,
          values,
          formDefinition.definition,
          createValuesForSubmit,
          createHudValuesForSubmit
        )
      )
        return;

      const input = {
        formDefinitionId: formDefinition.id,
        values: createValuesForSubmit(values, formDefinition.definition),
        hudValues: createHudValuesForSubmit(values, formDefinition.definition),
        recordId: record?.id,
        confirmed,
        ...inputVariables,
      };

      setErrors(emptyErrorState);
      void submitForm({ variables: { input: { input } } });
    },
    [formDefinition, inputVariables, submitForm, record]
  );

  // Top-level items for the left nav (of >=3 groups)
  const leftNavItems = useMemo(() => {
    if (!formDefinition || !itemMap) return false;

    let topLevelItems = formDefinition.definition.item.filter(
      (i) => i.type === ItemType.Group && !i.hidden
    );

    if (topLevelItems.length < 3) return false;

    // Remove disabled groups
    topLevelItems = topLevelItems.filter((item) =>
      shouldEnableItem(item, initialValues, itemMap)
    );
    if (topLevelItems.length < 3) return false;
    return topLevelItems;
  }, [itemMap, formDefinition, initialValues]);

  if (definitionLoading) return <Loading />;
  if (!formDefinition) return <NotFound text='Form definition not found.' />;

  const form = (
    <>
      <DynamicForm
        definition={formDefinition.definition}
        onSubmit={submitHandler}
        initialValues={initialValues}
        loading={saveLoading}
        errors={errors}
        {...props}
        FormActionProps={{
          submitButtonText: 'Save Changes',
          ...props.FormActionProps,
        }}
        ValidationDialogProps={{
          confirmText: 'Confirm Change',
          ...props.ValidationDialogProps,
        }}
      />
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
          <FormNavigation
            items={leftNavItems}
            top={top}
            {...FormNavigationProps}
          >
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
