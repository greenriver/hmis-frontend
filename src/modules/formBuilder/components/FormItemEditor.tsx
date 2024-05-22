import { Divider, Drawer, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import FormEditorItemPreview from '@/modules/formBuilder/components/FormEditorItemPreview';
import { FormItem, ItemType } from '@/types/gqlTypes';

interface FormItemEditorProps {
  selectedItem?: FormItem;
  handleClose: () => void;
}

const FormItemEditor: React.FC<FormItemEditorProps> = ({
  selectedItem,
  handleClose,
}) => {
  const [value, setValue] = useState<any>(undefined);
  if (!selectedItem) return;

  return (
    <Drawer
      open={!!selectedItem}
      onClose={() => {
        setValue(undefined);
        handleClose();
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
              selectedItem={selectedItem}
              value={value}
              setValue={setValue}
            />
          </>
        )}
        <Divider />
      </Stack>
    </Drawer>
  );
};

export default FormItemEditor;
