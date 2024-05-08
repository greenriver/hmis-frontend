import AccountBoxIcon from '@mui/icons-material/AccountBox';
import ListIcon from '@mui/icons-material/List';
import { Grid } from '@mui/material';
import React, { useMemo, useRef, useState } from 'react';
import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm, {
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import FormNavigation from '@/modules/form/components/FormNavigation';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import {
  AlwaysPresentLocalConstants,
  getInitialValues,
  getItemMap,
  getFormStepperItems,
} from '@/modules/form/util/formUtil';
import { useGetFormDefinitionFieldsForEditorQuery } from '@/types/gqlTypes';

type PreviewMode = 'preview' | 'readOnly';
const toggleItems: ToggleItem<PreviewMode>[] = [
  {
    value: 'preview',
    label: 'Preview Form',
    Icon: ListIcon,
  },
  {
    value: 'readOnly',
    label: 'Read Only View',
    Icon: AccountBoxIcon,
  },
];

const FormPreview = () => {
  const { formId } = useSafeParams() as { formId: string };
  const {
    data: { formDefinition } = {},
    loading,
    error,
  } = useGetFormDefinitionFieldsForEditorQuery({
    variables: { id: formId },
  });

  const formRef = useRef<DynamicFormRef>(null);

  // This form preview is not client- or enrollment-specific, so just use the always-present local constants
  const localConstants = AlwaysPresentLocalConstants;

  useScrollToHash(loading, STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT);

  const initialValues = useMemo(() => {
    return formDefinition?.definition
      ? {
          ...getInitialValues(formDefinition?.definition, localConstants),
        }
      : {};
  }, [formDefinition?.definition, localConstants]);
  const [formValues, setFormValues] = useState<object>(initialValues);

  const [toggleValue, setToggleValue] = useState<PreviewMode>('preview');

  const itemMap = useMemo(
    () => formDefinition && getItemMap(formDefinition.definition),
    [formDefinition]
  );

  const formStepperItems = useMemo(
    () =>
      getFormStepperItems(
        formDefinition,
        itemMap,
        initialValues,
        localConstants
      ),
    [itemMap, formDefinition, initialValues, localConstants]
  );

  const form = useMemo(() => {
    return (
      formDefinition &&
      (toggleValue === 'readOnly' ? (
        <DynamicView
          definition={formDefinition.definition}
          localConstants={localConstants}
          values={formValues}
        />
      ) : (
        <DynamicForm
          definition={formDefinition.definition}
          onSubmit={() => {}}
          onSaveDraft={(values) => setFormValues(values)}
          errors={{ errors: [], warnings: [] }}
          localConstants={localConstants}
          initialValues={initialValues}
          FormActionProps={{ config: [] }}
          ref={formRef}
        />
      ))
    );
  }, [formDefinition, formValues, localConstants, toggleValue]);

  if (loading && !formDefinition) return <Loading />;
  if (error) throw error;

  return (
    <>
      <PageTitle title={`Preview Form: ${formDefinition?.title}`} />
      <CommonToggle
        value={toggleValue}
        onChange={(value) => {
          setToggleValue(value);
          formRef.current?.SaveIfDirty();
        }}
        items={toggleItems}
        size='small'
        variant='gray'
        sx={{ mb: 4 }}
      />

      {formStepperItems ? (
        <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
          <FormNavigation items={formStepperItems}>{form}</FormNavigation>
        </Grid>
      ) : (
        form
      )}
    </>
  );
};

export default FormPreview;
