import { LoadingButton } from '@mui/lab';
import { Button, Paper, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { isEqual } from 'lodash-es';
import { useCallback, useEffect, useState } from 'react';
import {
  convertFormDefinition,
  updateFormItem,
} from '@/modules/form/util/formUtil';
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
  useUpdateFormDefinitionTypedMutation,
} from '@/types/gqlTypes';

interface FormBuilderContentsProps {
  formDefinition: FormDefinitionFieldsForEditorFragment;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
}

const FormBuilderContents: React.FC<FormBuilderContentsProps> = ({
  formDefinition,
  lastUpdatedDate,
  lastUpdatedBy,
}) => {
  const [workingDefinition, setWorkingDefinition] =
    useState<FormDefinitionJson>(formDefinition.definition);

  const [
    updateFormDefinitionTyped,
    { loading: updateLoading, error: updateError },
  ] = useUpdateFormDefinitionTypedMutation();

  const [selectedItem, setSelectedItem] = useState<FormItem | undefined>(
    undefined
  );
  const [originalLinkId, setOriginalLinkId] = useState<string | undefined>(
    undefined
  );

  const [dirty, setDirty] = useState(false);

  // TODO - dirty/clean form logic not yet working
  useEffect(() => {
    if (isEqual(formDefinition.definition, workingDefinition)) {
      setDirty(false);
    }
  }, [formDefinition.definition, workingDefinition]);

  useEffect(() => {
    if (!dirty && !isEqual(formDefinition.definition, workingDefinition))
      setDirty(true);
  }, [formDefinition.definition, workingDefinition, dirty]);

  const saveForm = useCallback(
    (newDefinition: FormDefinitionJson) => {
      return updateFormDefinitionTyped({
        variables: {
          id: formDefinition.id,
          definition: convertFormDefinition(newDefinition),
        },
      }).then((value) => {
        // TODO - check for errors on the returned object
        console.log(value);
        setWorkingDefinition(newDefinition);
      });
    },
    [updateFormDefinitionTyped, setWorkingDefinition, formDefinition.id]
  );

  if (updateError) throw updateError;

  return (
    <Box sx={{ display: 'flex' }}>
      <FormBuilderPalette
        onItemClick={(itemType) => {
          const newItem: FormItem = {
            linkId: crypto.randomUUID(), // TODO - this will only work in localhost
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
          saveLoading={updateLoading}
          onSave={(item, originalLinkId) => {
            const newDefinition = updateFormItem(
              workingDefinition,
              item,
              originalLinkId
            );

            saveForm(newDefinition).then(() => {
              setSelectedItem(undefined);
              setOriginalLinkId(undefined);
            });
          }}
          onDiscard={() => {
            setSelectedItem(undefined);
            setOriginalLinkId(undefined);
          }}
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
              saveForm(workingDefinition);
              setSelectedItem(item);
              setOriginalLinkId(item.linkId);
            }}
          />
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
                  loading={updateLoading}
                  onClick={() => {
                    saveForm(workingDefinition);
                  }}
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

export default FormBuilderContents;
