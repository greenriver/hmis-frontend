import { LoadingButton } from '@mui/lab';

import { Button, Divider, Paper, Typography } from '@mui/material';

import { Box, Stack } from '@mui/system';
import React, { useCallback, useState } from 'react';
import { FormProvider, useForm, useFormState } from 'react-hook-form';
import { generatePath, useNavigate } from 'react-router-dom';

import { v4 } from 'uuid';
import { useUpdateForm } from './useUpdateForm';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import theme from '@/config/theme';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import SaveSlide from '@/modules/form/components/SaveSlide';
import FormBuilderHeader from '@/modules/formBuilder/components/FormBuilderHeader';
import FormBuilderPalette from '@/modules/formBuilder/components/FormBuilderPalette';
import FormTree from '@/modules/formBuilder/components/formTree/FormTree';
import FormItemDrawer from '@/modules/formBuilder/components/itemEditor/FormItemDrawer';

import { AdminDashboardRoutes } from '@/routes/routes';

import {
  FormDefinitionFieldsForEditorFragment,
  FormDefinitionJson,
  FormItem,
} from '@/types/gqlTypes';

interface FormBuilderProps {
  formDefinition: FormDefinitionFieldsForEditorFragment;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  formDefinition, // initial values for form definition
}) => {
  const navigate = useNavigate();
  // React-hook-forms method for the form structure (reordering items)
  const rhfMethods = useForm<FormDefinitionJson>({
    defaultValues: formDefinition.definition,
  });
  const { control, reset } = rhfMethods;
  const { isDirty } = useFormState({ control });

  // The selected item is the one that is open for editing in the drawer
  const [selectedItem, setSelectedItem] = useState<FormItem | undefined>(
    undefined
  );

  // Function that is currently blocked from executing due to unsaved changes
  const [blockedActionFunction, setBlockedActionFunction] = useState<
    VoidFunction | undefined
  >(undefined);

  // onSuccess callback used for both submissions (item drawer + form tree updates)
  const onSuccess = useCallback(
    (updatedForm: FormDefinitionJson) => {
      // Reset form state to the updated form definition
      reset(updatedForm);
      // De-select the current item. (Only relevant for item editor drawer)
      setSelectedItem(undefined);
      // If there is a blocked action, execute it now. (Not relevant for item editor drawer)
      if (blockedActionFunction) blockedActionFunction();
      setBlockedActionFunction(undefined);
    },
    [reset, blockedActionFunction]
  );

  const {
    updateForm,
    loading: saveLoading,
    errorState,
  } = useUpdateForm({ formId: formDefinition.id, onSuccess });

  const goToPreview = useCallback(() => {
    navigate(
      generatePath(AdminDashboardRoutes.PREVIEW_FORM_DRAFT, {
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

  return (
    // This FormProvider provides the form context for the Form Tree,
    // which is modified by clicking up an down arrows to reorder items.
    // It is NOT used by the Form Item Editor, which has its own separate form context and submission process.
    <FormProvider {...rhfMethods}>
      <ConfirmationDialog
        open={!!blockedActionFunction}
        loading={saveLoading}
        confirmText='Save changes'
        cancelText='Continue editing'
        title='Unsaved changes'
        onConfirm={rhfMethods.handleSubmit(updateForm)}
        onCancel={() => setBlockedActionFunction(undefined)}
        maxWidth='sm'
        fullWidth
      >
        <Typography>
          You have unsaved changes. Do you want to save your changes before
          proceeding?
        </Typography>
      </ConfirmationDialog>
      <FormItemDrawer
        item={selectedItem}
        definition={formDefinition}
        // If form item changes were discarded, just close the drawer
        onDiscard={() => setSelectedItem(undefined)}
        // If form was successfully updated, reset this "tree form" and close the drawer
        onSuccess={onSuccess}
        // Form can be closed without any changes made
        onClose={() => setSelectedItem(undefined)}
      />
      <Box
        display='flex'
        component='form'
        onSubmit={rhfMethods.handleSubmit(updateForm)}
      >
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
            <Paper sx={{ p: 2 }}>
              <Box sx={{ px: 2, pt: 1, pb: 4 }}>
                <FormBuilderHeader
                  formDefinition={formDefinition}
                  onClickPreview={onClickPreview}
                />
              </Box>
              <Divider />
              <Box sx={{ p: 2 }}>
                {/* <div>{isDirty ? 'DIRTY' : 'NOT DIRTY'}</div> */}
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
                />
                {errorState?.errors &&
                  errorState.errors.length > 0 &&
                  !selectedItem && (
                    <Stack gap={1} sx={{ mt: 4 }}>
                      <ErrorAlert key='errors' errors={errorState.errors} />
                    </Stack>
                  )}
              </Box>
            </Paper>
          </Box>
          <SaveSlide in={isDirty} direction='up' loading={saveLoading}>
            <Stack direction='row' justifyContent='end' alignItems='center'>
              <Stack direction='row' gap={2}>
                <Button variant='gray' onClick={() => reset()}>
                  Discard Changes
                </Button>
                <LoadingButton
                  type='submit'
                  variant='contained'
                  loading={saveLoading}
                  sx={{ px: 4 }}
                >
                  Save Draft
                </LoadingButton>
                {/* <Button>Publish</Button> */}
              </Stack>
            </Stack>
          </SaveSlide>
        </Box>
        <FormBuilderPalette
          onItemClick={(itemType) => {
            function editNewItem() {
              const newItem: FormItem = {
                linkId: `q_${v4().split('-')[0]}`, // Randomly generate a placeholder link ID
                text: undefined,
                type: itemType,
              };

              setSelectedItem(newItem);
            }

            if (isDirty) {
              setBlockedActionFunction(() => editNewItem);
            } else {
              editNewItem();
            }
          }}
        />
      </Box>
    </FormProvider>
  );
};

export default FormBuilder;
