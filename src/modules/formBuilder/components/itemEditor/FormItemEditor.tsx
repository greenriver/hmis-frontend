import { Divider, Drawer, Typography } from '@mui/material';
import React from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { ErrorState } from '@/modules/errors/util';
import FormEditorItemProperties from '@/modules/formBuilder/components/itemEditor/FormEditorItemProperties';
import {
  FormDefinitionFieldsForEditorFragment,
  FormItem,
  ItemType,
} from '@/types/gqlTypes';

interface FormItemEditorProps {
  item: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  saveLoading: boolean;
  onSave: (item: FormItem, initialLinkId: string) => void;
  onDiscard: () => void;
  onClose: () => void;
  errorState?: ErrorState;
}

const FormItemEditor: React.FC<FormItemEditorProps> = ({
  item,
  definition,
  onSave,
  onDiscard,
  onClose,
  saveLoading,
  errorState,
}) => {
  // Top-level form state lives here so that we know if it's dirty when attempting to close the drawer
  const handlers = useForm<DeepPartial<FormItem>>({
    values: item,
    defaultValues: {
      type: ItemType.String,
    },
    // TODO: can transform server errors into RHF FieldErrors so they get inlined into the form
    // https://react-hook-form.com/ts#FieldErrors
    // errors: errorState?.errors,
  });

  return (
    <Drawer
      open={!!item}
      onClose={(_event, reason) => {
        // allow closing the drawer on backdrop click if the form is not dirty
        if (reason === 'backdropClick' && !handlers.formState.isDirty) {
          onClose();
        }
      }}
      anchor='right'
      sx={{
        width: '50vw',
        '& .MuiDrawer-paper': {
          borderTop: 'none',
          // p: 2,
          width: '50vw',
        },
      }}
    >
      <Typography variant='cardTitle' sx={{ p: 2 }}>
        Edit Form Item: {item.linkId}
      </Typography>
      <Divider />
      {/** maybe just inline this component?  it gets basically the same props */}
      <FormEditorItemProperties
        initialItem={item}
        definition={definition}
        saveLoading={saveLoading}
        onSave={onSave}
        errorState={errorState}
        onDiscard={onDiscard}
        handlers={handlers}
      />
    </Drawer>
  );
};

export default FormItemEditor;
