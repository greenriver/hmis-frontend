import { Box, Grid } from '@mui/material';
import { ReactNode, Ref, useCallback, useMemo, useState } from 'react';

import useFormDefinition from '../hooks/useFormDefinition';
import useInitialFormValues from '../hooks/useInitialFormValues';
import { LocalConstants, SubmitFormAllowedTypes } from '../types';
import {
  createHudValuesForSubmit,
  createValuesForSubmit,
  debugFormValues,
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
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import {
  FormInput,
  FormRole,
  ItemType,
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
  minGroupsForLeftNav?: number;
  formRef?: Ref<DynamicFormRef>;
}

/**
 * Renders a form for creating or updating a record
 */
const EditRecord = <RecordType extends SubmitFormAllowedTypes>({
  formRole,
  record,
  onCompleted,
  title,
  FormNavigationProps,
  inputVariables = {},
  localConstants = {},
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
  minGroupsForLeftNav = 3,
  formRef,
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

  const initialValues = useInitialFormValues({
    record,
    itemMap,
    definition: formDefinition?.definition,
    localConstants,
  });

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

    if (topLevelItems.length < minGroupsForLeftNav) return false;

    // Remove disabled groups
    topLevelItems = topLevelItems.filter((item) =>
      shouldEnableItem(item, initialValues, itemMap)
    );
    if (topLevelItems.length < 3) return false;
    return topLevelItems;
  }, [itemMap, formDefinition, initialValues, minGroupsForLeftNav]);

  if (definitionLoading) return <Loading />;
  if (!formDefinition) return <NotFound text='Form definition not found.' />;

  const form = (
    <>
      <DynamicForm
        ref={formRef}
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
      <Grid container spacing={2} sx={{ mb: props.hideSubmit ? 2 : 20, mt: 0 }}>
        <Grid item xs>
          {form}
        </Grid>
      </Grid>
    </>
  );
};

export default EditRecord;
