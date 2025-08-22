import { Button } from '@mui/material';
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
  DynamicFormOnSaveDraft,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import FormNavigationContainer from '@/modules/form/components/FormNavigationContainer';
import DynamicView from '@/modules/form/components/viewable/DynamicView';

import {
  AlwaysPresentLocalConstants,
  createInitialValuesFromSavedValues,
  createValuesForSubmit,
  getFormStepperItems,
  getInitialValues,
  getItemMap,
} from '@/modules/form/util/formUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  FormRole,
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

export const DUMMY_CLIENT_ID = 'dummy-value';

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

  const localConstants = useMemo(() => {
    // Add the always-present local constants
    const localConstants: Record<string, any> = {
      ...AlwaysPresentLocalConstants,
    };

    // Depending on the form role, add fake values for local constants expected by specific forms
    if (formDefinition?.role === FormRole.CustomAssessment) {
      localConstants.clientId = DUMMY_CLIENT_ID;
    }

    return localConstants;
  }, [formDefinition?.role]);

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
    (values: Parameters<DynamicFormOnSaveDraft>[0]) =>
      formDefinition &&
      setFormValues(
        createValuesForSubmit(values.rawValues, formDefinition.definition)
      ),
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
  const { publishLoading, onPublishForm, publishErrorState } = usePublishForm({
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
          onChange={(value: PreviewMode) => {
            setToggleValue(value);
            // Trigger save to update `formValues` state when toggling away from Edit-mode
            if (value === 'readOnly') {
              formRef.current?.SaveDraftForm();
            }
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
              errorState={publishErrorState}
            >
              <div>Are you sure you want to publish this form?</div>
            </ConfirmationDialog>
          </RootPermissionsFilter>
        )}
      </Stack>

      <SentryErrorBoundary>
        <FormNavigationContainer navItems={formStepperItems}>
          {form}
        </FormNavigationContainer>
      </SentryErrorBoundary>
    </>
  );
};

export default FormPreview;
