import { FetchResult } from '@apollo/client';
import { LoadingButton } from '@mui/lab';
import { Button, Paper, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
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
  ValidationError,
} from '@/types/gqlTypes';

interface FormBuilderContentsProps {
  formDefinition: FormDefinitionFieldsForEditorFragment;
  onSave: (
    formDefinition: FormDefinitionJson
  ) => Promise<FetchResult<UpdateFormDefinitionMutation>>;
  saveLoading: boolean;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
}

const FormBuilderContents: React.FC<FormBuilderContentsProps> = ({
  formDefinition,
  onSave,
  saveLoading,
  lastUpdatedDate,
  lastUpdatedBy,
}) => {
  const [workingDefinition, setWorkingDefinition] =
    useState<FormDefinitionJson>(formDefinition.definition);

  const [selectedItem, setSelectedItem] = useState<FormItem | undefined>(
    undefined
  );
  const [originalLinkId, setOriginalLinkId] = useState<string | undefined>(
    undefined
  );

  const closeItemEditor = () => {
    setSelectedItem(undefined);
    setOriginalLinkId(undefined);
  };

  const [dirty, setDirty] = useState(false);

  const [itemErrors, setItemErrors] = useState<ValidationError[]>([]);
  const [formErrors, setFormErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (isEqual(formDefinition.definition, workingDefinition)) {
      setDirty(false);
    }
  }, [formDefinition.definition, workingDefinition]);

  useEffect(() => {
    if (!dirty && !isEqual(formDefinition.definition, workingDefinition))
      setDirty(true);
  }, [formDefinition.definition, workingDefinition, dirty]);

  useEffect(() => {
    setWorkingDefinition(formDefinition.definition);
  }, [formDefinition.definition]);

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
          errors={itemErrors}
          onSave={(item, originalLinkId) => {
            const newDefinition = updateFormItem(
              workingDefinition,
              item,
              originalLinkId
            );

            onSave(newDefinition).then((values) => {
              if (values.data?.updateFormDefinition?.errors) {
                setItemErrors(values.data?.updateFormDefinition?.errors);
              } else {
                setItemErrors([]);
                closeItemEditor();
              }
            });
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
          {formErrors && formErrors.length > 0 && (
            <Stack gap={1} sx={{ mt: 4 }}>
              <ErrorAlert key='errors' errors={formErrors} />
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
                  onClick={() => {
                    onSave(workingDefinition).then((values) => {
                      if (values.data?.updateFormDefinition?.errors) {
                        setFormErrors(
                          values.data?.updateFormDefinition?.errors
                        );
                      } else {
                        setFormErrors([]);
                      }
                    });
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