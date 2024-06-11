import { Divider, Drawer, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import React, { useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { displayLabelForItem } from '../../formBuilderUtil';
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

  // If typename is not present, then this is a new item that hasn't been saved yet.
  const isNewItem = useMemo(() => !item.__typename, [item]);

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
      <Typography variant='cardTitle' component='h2' sx={{ p: 2 }}>
        <Typography variant='overline' component='div'>
          {isNewItem ? 'Add New Form item' : 'Edit Form Item'}
        </Typography>
        {isNewItem
          ? `${startCase(item.type.toLowerCase())} Item`
          : displayLabelForItem(item)}
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
        isNewItem={isNewItem}
      />
    </Drawer>
  );
};

export default FormItemEditor;
