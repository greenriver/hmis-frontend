import { Divider, Drawer, Stack, Typography } from '@mui/material';
import React from 'react';
import { ErrorState } from '@/modules/errors/util';
import FormEditorItemProperties from '@/modules/formBuilder/components/FormEditorItemProperties';
import {
  FormDefinitionFieldsForEditorFragment,
  FormItem,
} from '@/types/gqlTypes';

interface FormItemEditorProps {
  item: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  handleClose?: () => void;
  saveLoading: boolean;
  onSave: (item: FormItem, initialLinkId: string) => void;
  onDiscard: () => void;
  errorState?: ErrorState;
}

const FormItemEditor: React.FC<FormItemEditorProps> = ({
  item,
  definition,
  handleClose,
  onSave,
  onDiscard,
  saveLoading,
  errorState,
}) => {
  return (
    <Drawer
      open={!!item}
      onClose={handleClose}
      anchor='right'
      sx={{
        width: '50vw',
        '& .MuiDrawer-paper': {
          borderTop: 'none',
          p: 2,
          width: '50vw',
        },
      }}
    >
      <Stack gap={2}>
        <Typography variant='cardTitle'>
          Edit Form Item: {item.linkId}
        </Typography>
        <Divider />
        <FormEditorItemProperties
          initialItem={item}
          definition={definition}
          saveLoading={saveLoading}
          onSave={onSave}
          errorState={errorState}
          onDiscard={onDiscard}
        />
      </Stack>
    </Drawer>
  );
};

export default FormItemEditor;
