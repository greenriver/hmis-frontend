import { Button, DialogActions, DialogContent, Stack } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import FormSelect from '@/modules/form/components/FormSelect';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import { cache } from '@/providers/apolloClient';
import {
  ItemType,
  PickListType,
  useCreateCeOpportunityMutation,
} from '@/types/gqlTypes';

interface Props {
  projectId: string;
}
const CreateOpportunityButton: React.FC<Props> = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(null);

  const [createOpportunity, { loading, error }] =
    useCreateCeOpportunityMutation({
      variables: {
        projectId,
        input: {
          name: name || '',
          templateId: templateId || '',
        },
      },
      onCompleted: () => {
        cache.evict({
          id: `Project:${projectId}`,
          fieldName: 'ceOpportunities',
        });
        setOpen(false);
      },
    });

  const { pickList: templateList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.WorkflowDefinitionTemplates,
    },
  });

  if (error) throw error;

  return (
    <>
      <Button onClick={() => setOpen(true)} variant='outlined'>
        Create Opportunity
      </Button>
      <CommonDialog fullWidth open={open}>
        <DialogTitle>Create Opportunity</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack gap={2}>
            <TextInput
              label={
                <RequiredLabel
                  text='Name'
                  TypographyProps={{
                    fontWeight: 'bold',
                  }}
                  required={true}
                />
              }
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <FormSelect
              label={
                <RequiredLabel
                  text='Template'
                  TypographyProps={{
                    fontWeight: 'bold',
                  }}
                  required={true}
                />
              }
              options={templateList}
              onChange={(_event, option) => {
                if (isPickListOption(option)) {
                  setTemplateId(option.code);
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <FormDialogActionContent
            onSubmit={() => createOpportunity()}
            disabled={!name || !templateId}
            onDiscard={() => setOpen(false)}
            submitLoading={loading}
          />
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default CreateOpportunityButton;
