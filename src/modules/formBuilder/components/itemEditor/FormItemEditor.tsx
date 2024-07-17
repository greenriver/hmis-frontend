import { Divider, Drawer, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import React, { useCallback, useMemo } from 'react';
import { DeepPartial, useForm } from 'react-hook-form';
import { displayLabelForItem, updateFormItem } from '../../formBuilderUtil';
import { useUpdateForm } from '../useUpdateForm';
import FormEditorItemProperties from '@/modules/formBuilder/components/itemEditor/FormEditorItemProperties';
import {
  FormDefinitionFieldsForEditorFragment,
  FormDefinitionJson,
  FormItem,
} from '@/types/gqlTypes';

interface FormItemEditorProps {
  item: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  onSuccess: (updatedForm: FormDefinitionJson) => void;
  onDiscard: () => void;
  onClose: () => void;
}

const FormItemEditor: React.FC<FormItemEditorProps> = ({
  item,
  definition,
  onSuccess,
  onDiscard,
  onClose,
}) => {
  // Top-level form state lives here so that we know if it's dirty when attempting to close the drawer
  const handlers = useForm<DeepPartial<FormItem>>({
    defaultValues: item,
    // TODO: can transform server errors into RHF FieldErrors so they get inlined into the form
    // https://react-hook-form.com/ts#FieldErrors
    // errors: errorState?.errors,
    mode: 'onChange', // allows custom RHF validator functions to run when fields change
  });

  const {
    updateForm,
    loading: saveLoading,
    errorState,
  } = useUpdateForm({ formId: definition.id, onSuccess });

  const onSave = useCallback(
    (updatedItem: FormItem, initialLinkId: string) => {
      const newDefinition = updateFormItem(
        definition.definition,
        updatedItem,
        initialLinkId
      );

      updateForm(newDefinition);
    },
    [definition.definition, updateForm]
  );
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
        <Typography variant='overline' color='links' display='block'>
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
