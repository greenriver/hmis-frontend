import { Divider, Drawer, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import FormEditorItemPreview from '@/modules/formBuilder/components/FormEditorItemPreview';
import FormEditorItemProperties from '@/modules/formBuilder/components/FormEditorItemProperties';
import {
  FormDefinitionFieldsForEditorFragment,
  FormItem,
  ItemType,
} from '@/types/gqlTypes';

interface FormItemEditorProps {
  selectedItem: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  handleClose: () => void;
}

const FormItemEditor: React.FC<FormItemEditorProps> = ({
  selectedItem,
  definition,
  handleClose,
}) => {
  const [value, setValue] = useState<any>(undefined);

  const [workingItem, setWorkingItem] = useState<FormItem>(selectedItem);

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
              item={workingItem}
              value={value}
              setValue={setValue}
            />
          </>
        )}
        <Divider />
        <FormEditorItemProperties
          item={workingItem}
          definition={definition}
          onChangeProperty={(attr, newProperty) => {
            setWorkingItem({
              ...workingItem,
              [attr]: newProperty,
            });
          }}
        />
      </Stack>
    </Drawer>
  );
};

export default FormItemEditor;
