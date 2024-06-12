import { FetchResult } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import { Button, Paper, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { isEqual } from 'lodash-es';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { v4 } from 'uuid';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import Loading from '@/components/elements/Loading';
import theme from '@/config/theme';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState } from '@/modules/errors/util';
import FormBuilderHeader from '@/modules/formBuilder/components/FormBuilderHeader';
import FormBuilderPalette from '@/modules/formBuilder/components/FormBuilderPalette';
import FormTree from '@/modules/formBuilder/components/formTree/FormTree';
import FormItemEditor from '@/modules/formBuilder/components/itemEditor/FormItemEditor';
import { updateFormItem } from '@/modules/formBuilder/formBuilderUtil';
import {
  DisabledDisplay,
  EnableBehavior,
  FormDefinitionFieldsForEditorFragment,
  FormDefinitionJson,
  FormItem,
  UpdateFormDefinitionMutation,
} from '@/types/gqlTypes';

interface FormBuilderProps {
  formDefinition: FormDefinitionFieldsForEditorFragment;
  workingDefinition?: FormDefinitionJson;
  setWorkingDefinition?: Dispatch<
    SetStateAction<FormDefinitionJson | undefined>
  >;
  errorState?: ErrorState;
  onSave: (
    formDefinition: FormDefinitionJson
  ) => Promise<FetchResult<UpdateFormDefinitionMutation>>;
  saveLoading: boolean;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
  selectedItem?: FormItem;
  setSelectedItem: Dispatch<SetStateAction<FormItem | undefined>>;
}

const FormBuilder: React.FC<FormBuilderProps> = ({
  formDefinition,
  workingDefinition,
  setWorkingDefinition,
  errorState,
  onSave,
  saveLoading,
  lastUpdatedDate,
  lastUpdatedBy,
  selectedItem,
  setSelectedItem,
}) => {
  const dirty = useMemo(() => {
    return !isEqual(workingDefinition, formDefinition.definition);
  }, [workingDefinition, formDefinition.definition]);

  const [blockedActionFunction, setBlockedActionFunction] = useState<
    VoidFunction | undefined
  >(undefined);

  const onClickPreview = useCallback(() => {
    if (dirty) {
      setBlockedActionFunction(() => undefined); // TODO(#6091)
    }
  }, [setBlockedActionFunction, dirty]);

  const onConfirmSave = useCallback(() => {
    if (!workingDefinition) return;

    onSave(workingDefinition).then(() => {
      if (blockedActionFunction) blockedActionFunction();
      setBlockedActionFunction(undefined);
    });
  }, [
    workingDefinition,
    blockedActionFunction,
    setBlockedActionFunction,
    onSave,
  ]);

  if (!workingDefinition || !setWorkingDefinition) return <Loading />;

  return (
    <>
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
            const newDefinition = updateFormItem(
              workingDefinition,
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
              lastUpdatedDate={lastUpdatedDate}
              onClickPreview={onClickPreview}
            />
            <Box sx={{ p: 4 }}>
              <FormTree
                definition={workingDefinition}
                onEditClick={(item: FormItem) => {
                  function editItem() {
                    setSelectedItem(item);
                  }

                  if (dirty) {
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
            {dirty && (
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
                      onClick={() => onSave(workingDefinition)}
                    >
                      Save Draft
                    </LoadingButton>
                    <Button>Publish</Button>
                  </Stack>
                  <Typography variant='body2'>
                    Last saved on {lastUpdatedDate} by {lastUpdatedBy}
                  </Typography>
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
    </>
  );
};

export default FormBuilder;
