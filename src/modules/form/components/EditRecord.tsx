import { Box, Grid } from '@mui/material';
import { ReactNode, Ref, useMemo } from 'react';

import { useDynamicFormHandlersForRecord } from '../hooks/useDynamicFormHandlersForRecord';
import useFormDefinition from '../hooks/useFormDefinition';
import { LocalConstants, SubmitFormAllowedTypes } from '../types';
import {
  AlwaysPresentLocalConstants,
  getFormStepperItems,
} from '../util/formUtil';

import FormNavigation, { FormNavigationProps } from './FormNavigation';

import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import NotFound from '@/components/pages/NotFound';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm, {
  DynamicFormProps,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import { FormInput, RecordFormRole } from '@/types/gqlTypes';

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
  formRole: RecordFormRole;
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
  inputVariables,
  localConstants: localConstantsProp,
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
  minGroupsForLeftNav = 3,
  formRef,
  ...props
}: Props<RecordType>) => {
  const localConstants: LocalConstants = useMemo(
    () => ({ ...AlwaysPresentLocalConstants, ...localConstantsProp }),
    [localConstantsProp]
  );

  const { formDefinition, loading: definitionLoading } = useFormDefinition({
    role: formRole,
    // hack: pull project id from one of the existing args, if it exists.
    // this project will be used to evaluate and "rules" on the resolved form definition.
    projectId: localConstants?.projectId || inputVariables?.projectId,
  });

  const { initialValues, itemMap, errors, onSubmit, submitLoading } =
    useDynamicFormHandlersForRecord({
      inputVariables,
      localConstants,
      formDefinition,
      record,
      onCompleted,
    });

  useScrollToHash(definitionLoading, top);

  // Top-level items for the left nav (of >=3 groups)
  const leftNavItems = useMemo(
    () =>
      getFormStepperItems(
        formDefinition,
        itemMap,
        initialValues,
        localConstants,
        minGroupsForLeftNav
      ),
    [
      itemMap,
      formDefinition,
      initialValues,
      minGroupsForLeftNav,
      localConstants,
    ]
  );

  if (definitionLoading) return <Loading />;
  if (!formDefinition) return <NotFound text='Form definition not found.' />;

  const form = (
    <>
      <DynamicForm
        ref={formRef}
        definition={formDefinition.definition}
        onSubmit={onSubmit}
        initialValues={initialValues}
        loading={submitLoading}
        errors={errors}
        localConstants={localConstants}
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
