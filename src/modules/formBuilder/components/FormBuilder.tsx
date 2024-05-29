import { FetchResult } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import { Button, Paper, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { isEqual } from 'lodash-es';
import { Dispatch, SetStateAction, useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState } from '@/modules/errors/util';
import { updateFormItem } from '@/modules/form/util/formUtil';
import FormBuilderHeader from '@/modules/formBuilder/components/FormBuilderHeader';
import FormBuilderPalette from '@/modules/formBuilder/components/FormBuilderPalette';
import FormItemEditor from '@/modules/formBuilder/components/FormItemEditor';
import FormTree from '@/modules/formBuilder/components/formTree/FormTree';
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
  originalLinkId?: string;
  setOriginalLinkId: Dispatch<SetStateAction<string | undefined>>;
  closeItemEditor: () => void;
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
  originalLinkId,
  setOriginalLinkId,
  closeItemEditor,
}) => {
  const dirty = useMemo(() => {
    return !isEqual(workingDefinition, formDefinition.definition);
  }, [workingDefinition, formDefinition.definition]);

  if (!workingDefinition || !setWorkingDefinition) return <Loading />;

  return (
    <Box sx={{ display: 'flex' }}>
      <FormBuilderPalette
        onItemClick={(itemType) => {
          const newItem: FormItem = {
            linkId: crypto.randomUUID(), // TODO(#6083) - this is a placeholder, but right now will only work in localhost
            text: itemType.toString(),
            type: itemType,
            required: false,
            warnIfEmpty: false,
            hidden: false,
            readOnly: false,
            repeats: false,
            prefill: false,
            disabledDisplay: DisabledDisplay.Hidden,
            enableBehavior: EnableBehavior.Any,
          };

          const newDefinition: FormDefinitionJson = {
            ...workingDefinition,
            item: [...workingDefinition.item, newItem],
          };

          setWorkingDefinition(newDefinition);
        }}
      />
      {selectedItem && originalLinkId && (
        <FormItemEditor
          selectedItem={selectedItem}
          originalLinkId={originalLinkId}
          definition={formDefinition}
          saveLoading={saveLoading}
          errorState={errorState}
          onSave={(item, originalLinkId) => {
            const newDefinition = updateFormItem(
              workingDefinition,
              item,
              originalLinkId
            );

            onSave(newDefinition);
          }}
          onDiscard={closeItemEditor}
        />
      )}
      <Box
        sx={
          // Padding matches the padding usually applied in DashboardContentContainer.
          // (It's moved in here because of the drawer)
          {
            flexGrow: 1,
            pt: 2,
            pb: 8,
            px: { xs: 1, sm: 3, lg: 4 },
          }
        }
      >
        <FormBuilderHeader
          formDefinition={formDefinition}
          lastUpdatedDate={lastUpdatedDate}
        />
        <Box sx={{ p: 4 }}>
          <FormTree
            definition={workingDefinition}
            onEditClick={(item: FormItem) => {
              // todo @martha - this should NOT auto-save, it should instead prompt to save
              // onSave(workingDefinition).then((values) => {
              //   console.log(values);
              // });
              setSelectedItem(item);
              setOriginalLinkId(item.linkId);
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
  );
};

export default FormBuilder;
