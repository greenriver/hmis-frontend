import { DialogActions, DialogContent, Stack } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import FormSelect from '@/modules/form/components/FormSelect';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import {
  ItemType,
  PickListType,
  useMarkUnitsAvailableMutation,
} from '@/types/gqlTypes';

interface Props {
  open: boolean;
  onClose: VoidFunction;
  unitIds?: string[];
}
const MarkUnitsAvailableDialog: React.FC<Props> = ({
  open,
  onClose,
  unitIds,
}) => {
  const [templateId, setTemplateId] = useState<string | null>(null);

  const [markUnitsAvailable, { loading, error }] =
    useMarkUnitsAvailableMutation({
      variables: {
        unitIds: unitIds || [],
        templateId: templateId || '',
      },
      onCompleted: () => {
        onClose();
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
    <CommonDialog fullWidth open={open}>
      <DialogTitle>Mark Available</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Stack gap={2}>
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
          onSubmit={() => {
            if (!unitIds || unitIds.length === 0 || !templateId) {
              throw new Error(
                'Something went wrong. Form to mark units available should be disabled'
              );
            }
            markUnitsAvailable();
          }}
          disabled={!templateId}
          onDiscard={onClose}
          submitLoading={loading}
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default MarkUnitsAvailableDialog;
