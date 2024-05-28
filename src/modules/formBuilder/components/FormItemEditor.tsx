import { Divider, Drawer, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import FormEditorItemPreview from '@/modules/formBuilder/components/FormEditorItemPreview';
import FormEditorItemProperties from '@/modules/formBuilder/components/FormEditorItemProperties';
import {
  FormDefinitionFieldsForEditorFragment,
  FormItem,
  ItemType,
  ValidationError,
} from '@/types/gqlTypes';

interface FormItemEditorProps {
  selectedItem: FormItem;
  originalLinkId: string;
  definition: FormDefinitionFieldsForEditorFragment;
  handleClose?: () => void;
  saveLoading: boolean;
  errors: ValidationError[];
  onSave: (item: FormItem, originalLinkId: string) => void;
  onDiscard: () => void;
}

const FormItemEditor: React.FC<FormItemEditorProps> = ({
  selectedItem,
  originalLinkId,
  definition,
  handleClose,
  onSave,
  onDiscard,
  saveLoading,
  errors,
}) => {
  const [value, setValue] = useState<any>(undefined);

  const [workingItem, setWorkingItem] = useState<FormItem>(selectedItem);

  return (
    <Drawer
      open={!!selectedItem}
      onClose={() => {
        setValue(undefined);
        if (handleClose) handleClose();
      }}
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
          Edit Form Item: {selectedItem.linkId}
        </Typography>
        {selectedItem.type !== ItemType.Group && (
          <>
            <Divider />
            <FormEditorItemPreview
              item={workingItem}
              value={value}
              setValue={setValue}
            />
          </>
        )}
        <Divider />
        <FormEditorItemProperties
          item={workingItem}
          originalLinkId={originalLinkId}
          definition={definition}
          onChangeProperty={(attr, newProperty) => {
            setWorkingItem({
              ...workingItem,
              [attr]: newProperty,
            });
          }}
          saveLoading={saveLoading}
          onSave={onSave}
          errors={errors}
          onDiscard={onDiscard}
        />
      </Stack>
    </Drawer>
  );
};

export default FormItemEditor;
