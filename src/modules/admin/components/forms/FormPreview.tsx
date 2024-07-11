import { Button, Grid } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useMemo, useRef, useState } from 'react';
import { generatePath } from 'react-router-dom';
import { usePublishForm } from './usePublishForm';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import DynamicForm, {
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import FormNavigation from '@/modules/form/components/FormNavigation';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { FormValues } from '@/modules/form/types';
import {
  AlwaysPresentLocalConstants,
  createInitialValuesFromSavedValues,
  getFormStepperItems,
  getInitialValues,
  getItemMap,
  createValuesForSubmit,
} from '@/modules/form/util/formUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormStatus,
  useGetFormDefinitionFieldsForEditorQuery,
} from '@/types/gqlTypes';

export type PreviewMode = 'input' | 'readOnly';
export const toggleItems: ToggleItem<PreviewMode>[] = [
  {
    value: 'input',
    label: 'Input View',
  },
  {
    value: 'readOnly',
    label: 'Read Only View',
  },
];

// Component for previewing a form, and optionally publishing it.
// Publish is possible if it is a draft and user has appropriate permission.
const FormPreview = () => {
  const { formId } = useSafeParams() as { formId: string };
  const [toggleValue, setToggleValue] = useState<PreviewMode>('input');

  const {
    data: { formDefinition } = {},
    loading,
    error,
  } = useGetFormDefinitionFieldsForEditorQuery({
    variables: { id: formId },
  });

  const formRef = useRef<DynamicFormRef>(null);

  // This form preview is not client- or enrollment-specific, so just use the always-present local constants.
  // This could be adjusted to show fake constants depending on the form role.
  const localConstants = AlwaysPresentLocalConstants;

  useScrollToHash(loading, STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT);

  // Initial values based on item.initial properties
  const initialValues = useMemo(() => {
    if (!formDefinition?.definition) return {};
    return getInitialValues(formDefinition.definition, localConstants);
  }, [formDefinition?.definition, localConstants]);

  // Current form state, which updates when user toggles away from "input view" mode
  // This has the same shape as WIP Values when saved (e.g. a map keyed by Link ID)
  const [formValues, setFormValues] = useState<object>(initialValues);

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

  const onSaveFormValues = useCallback(
    (values: FormValues) =>
      formDefinition &&
      setFormValues(createValuesForSubmit(values, formDefinition.definition)),
    [formDefinition]
  );

  const form = useMemo(() => {
    if (!itemMap) return;

    // transformation to fill in pick list option labels, among other things
    const formState = createInitialValuesFromSavedValues(itemMap, formValues);

    return (
      formDefinition &&
      (toggleValue === 'readOnly' ? (
        <DynamicView
          definition={formDefinition.definition}
          localConstants={localConstants}
          values={formState}
        />
      ) : (
        <DynamicForm
          definition={formDefinition.definition}
          onSubmit={() => {}}
          onSaveDraft={onSaveFormValues}
          errors={{ errors: [], warnings: [] }}
          localConstants={localConstants}
          initialValues={formState}
          hideSubmit
          ref={formRef}
        />
      ))
    );
  }, [
    formDefinition,
    formValues,
    itemMap,
    localConstants,
    onSaveFormValues,
    toggleValue,
  ]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const { publishLoading, onPublishForm } = usePublishForm({
    formId: formDefinition?.id,
    formIdentifier: formDefinition?.identifier,
  });

  if (loading && !formDefinition) return <Loading />;
  if (error) throw error;

  if (!formDefinition) return <NotFound />;

  return (
    <>
      <PageTitle
        title={formDefinition.title}
        overlineText={
          formDefinition.status === FormStatus.Draft
            ? 'Previewing Draft'
            : 'Previewing Form'
        }
      />
      <Stack direction='row' justifyContent='space-between' sx={{ mb: 4 }}>
        <CommonToggle
          value={toggleValue}
          onChange={(value) => {
            setToggleValue(value);
            formRef.current?.SaveIfDirty();
          }}
          items={toggleItems}
          size='small'
          variant='gray'
        />

        {formDefinition.status === FormStatus.Draft && (
          <RootPermissionsFilter permissions='canManageForms'>
            <Stack direction='row' spacing={4}>
              <ButtonLink
                onClick={() => setConfirmOpen(true)}
                variant='text'
                sx={{ px: 4 }}
                to={generatePath(AdminDashboardRoutes.EDIT_FORM, {
                  identifier: formDefinition?.identifier,
                  formId: formDefinition?.id,
                })}
              >
                Edit Draft
              </ButtonLink>
              <Button onClick={() => setConfirmOpen(true)} sx={{ px: 6 }}>
                Publish
              </Button>
            </Stack>
            <ConfirmationDialog
              id='publish'
              open={confirmOpen}
              title='Confirm Publish'
              onConfirm={onPublishForm}
              onCancel={() => setConfirmOpen(false)}
              loading={publishLoading}
            >
              <div>Are you sure you want to publish this form?</div>
            </ConfirmationDialog>
          </RootPermissionsFilter>
        )}
      </Stack>

      <SentryErrorBoundary>
        {formStepperItems ? (
          <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
            <FormNavigation items={formStepperItems}>{form}</FormNavigation>
          </Grid>
        ) : (
          form
        )}
      </SentryErrorBoundary>
    </>
  );
};

export default FormPreview;
