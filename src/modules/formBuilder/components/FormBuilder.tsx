import { LoadingButton } from '@mui/lab';
import { Button, Paper, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useFormState } from 'react-hook-form';
import { generatePath, useNavigate } from 'react-router-dom';

import { v4 } from 'uuid';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import theme from '@/config/theme';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import {
  ErrorState,
  emptyErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import FormBuilderHeader from '@/modules/formBuilder/components/FormBuilderHeader';
import FormBuilderPalette from '@/modules/formBuilder/components/FormBuilderPalette';
import FormTree from '@/modules/formBuilder/components/formTree/FormTree';
import FormItemEditor from '@/modules/formBuilder/components/itemEditor/FormItemEditor';

import {
  getItemIdMap,
  updateFormItem,
} from '@/modules/formBuilder/formBuilderUtil';

import { AdminDashboardRoutes } from '@/routes/routes';

import {
  DisabledDisplay,
  EnableBehavior,
  FormDefinitionFieldsForEditorFragment,
  FormDefinitionJson,
  FormItem,
  useUpdateFormDefinitionMutation,
} from '@/types/gqlTypes';

interface FormBuilderProps {
  formDefinition: FormDefinitionFieldsForEditorFragment;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  formDefinition, // initial values for form definition
}) => {
  const rhfMethods = useForm<FormDefinitionJson>({
    defaultValues: formDefinition.definition,
  });

  const { control, getValues } = rhfMethods;

  const [selectedItem, setSelectedItem] = useState<FormItem | undefined>(
    undefined
  );

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  useEffect(() => {
    setErrorState(emptyErrorState);
  }, [selectedItem, setErrorState]);

  const [updateFormDefinition, { loading: saveLoading, error: saveError }] =
    useUpdateFormDefinitionMutation({
      onCompleted: (data) => {
        if (
          data.updateFormDefinition?.errors &&
          data.updateFormDefinition.errors.length > 0
        ) {
          setErrorState(partitionValidations(data.updateFormDefinition.errors));
        } else if (data.updateFormDefinition?.formDefinition) {
          setErrorState(emptyErrorState);
          setSelectedItem(undefined);

          // Reset the form. Use the returned definition as the defaultValues.
          rhfMethods.reset(data.updateFormDefinition.formDefinition.definition);
        } else {
          throw new Error('unexpected response');
        }
      },
    });

  if (saveError) throw saveError;

  const onSave = useCallback(
    (newDefinition: FormDefinitionJson) => {
      return updateFormDefinition({
        variables: {
          id: formDefinition.id,
          input: { definition: JSON.stringify(newDefinition) },
        },
      });
    },
    [formDefinition.id, updateFormDefinition]
  );

  const itemIdMap = useMemo(() => getItemIdMap(getValues().item), [getValues]);

  const { isDirty } = useFormState({ control });

  const [blockedActionFunction, setBlockedActionFunction] = useState<
    VoidFunction | undefined
  >(undefined);

  const navigate = useNavigate();

  const goToPreview = useCallback(() => {
    navigate(
      generatePath(AdminDashboardRoutes.PREVIEW_FORM, {
        identifier: formDefinition.identifier,
        formId: formDefinition.id,
      })
    );
  }, [navigate, formDefinition]);

  const onClickPreview = useCallback(() => {
    if (isDirty) {
      setBlockedActionFunction(() => goToPreview);
    } else {
      goToPreview();
    }
  }, [setBlockedActionFunction, isDirty, goToPreview]);

  const onConfirmSave = useCallback(() => {
    // RHF has its own submit hooks that include validation, but we aren't using them here,
    // because reordering form items doesn't need validation.
    // (We could change this once we implement deletion of form items)
    onSave(getValues()).then(() => {
      if (blockedActionFunction) blockedActionFunction();
      setBlockedActionFunction(undefined);
    });
  }, [getValues, blockedActionFunction, setBlockedActionFunction, onSave]);

  return (
    //value={{ control, itemIdMap, getValues }}
    <FormProvider {...rhfMethods}>
      <ConfirmationDialog
        open={!!blockedActionFunction}
        loading={saveLoading}
        confirmText='Save changes'
        cancelText='Continue editing'
        title='Unsaved changes'
        onConfirm={onConfirmSave}
        onCancel={() => setBlockedActionFunction(undefined)}
        maxWidth='sm'
        fullWidth
      >
        <Typography>
          You have unsaved changes. Do you want to save your changes before
          proceeding?
        </Typography>
      </ConfirmationDialog>
      {selectedItem && (
        <FormItemEditor
          item={selectedItem}
          definition={formDefinition}
          saveLoading={saveLoading}
          errorState={errorState}
          onSave={(updatedItem, initialLinkId) => {
            if (isDirty) {
              // This should never happen
              throw new Error(
                "Can't save an individual item when the overall form structure has unsaved changes"
              );
            }

            const newDefinition = updateFormItem(
              formDefinition.definition,
              updatedItem,
              initialLinkId
            );

            onSave(newDefinition);
          }}
          onDiscard={() => setSelectedItem(undefined)}
          onClose={() => setSelectedItem(undefined)}
        />
      )}
      <Box display='flex'>
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              // Matches the styles usually applied in DashboardContentContainer.
              // (Moved in here because of the Palette drawer)
              maxWidth: `${theme.breakpoints.values.lg}px`,
              pt: 2,
              pb: 8,
              px: { xs: 1, sm: 3, lg: 4 },
            }}
          >
            <FormBuilderHeader
              formDefinition={formDefinition}
              onClickPreview={onClickPreview}
            />
            <Box sx={{ p: 4 }}>
              <div>{isDirty ? 'DIRTY' : 'NOT DIRTY'}</div>
              <FormTree
                onEditClick={(item: FormItem) => {
                  function editItem() {
                    setSelectedItem(item);
                  }

                  if (isDirty) {
                    // React's useState accepts either a value or a function that yields a value.
                    // In this case, we want the function itself to *be* the state value, which is the reason
                    // for defining `editItem` above instead of simply using `() => setSelectedItem(item)` here.
                    setBlockedActionFunction(() => editItem);
                  } else {
                    setSelectedItem(item);
                  }
                }}
                itemIdMap={itemIdMap}
              />
              {errorState?.errors &&
                errorState.errors.length > 0 &&
                !selectedItem && (
                  <Stack gap={1} sx={{ mt: 4 }}>
                    <ErrorAlert key='errors' errors={errorState.errors} />
                  </Stack>
                )}
            </Box>
            {isDirty && (
              <Paper sx={{ p: 4 }}>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  sx={{ alignItems: 'center' }}
                >
                  <Stack direction='row' gap={2}>
                    <LoadingButton
                      variant='outlined'
                      loading={saveLoading}
                      onClick={() => onSave(getValues())}
                    >
                      Save Draft
                    </LoadingButton>
                    <Button>Publish</Button>
                  </Stack>
                </Stack>
              </Paper>
            )}
          </Box>
        </Box>
        <FormBuilderPalette
          onItemClick={(itemType) => {
            const newItem: FormItem = {
              linkId: `q_${v4().split('-')[0]}`, // Randomly generate a placeholder link ID
              text: undefined,
              type: itemType,
              required: false,
              warnIfEmpty: false,
              hidden: false,
              readOnly: false,
              repeats: false,
              prefill: false,
              disabledDisplay: DisabledDisplay.Hidden,
              enableBehavior: EnableBehavior.All,
            };

            setSelectedItem(newItem);
          }}
        />
      </Box>
    </FormProvider>
  );
};

export default FormBuilder;
