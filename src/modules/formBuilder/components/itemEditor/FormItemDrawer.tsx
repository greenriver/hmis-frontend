import { Drawer } from '@mui/material';
import React, { useState } from 'react';
import FormEditorItemProperties from '@/modules/formBuilder/components/itemEditor/FormEditorItemProperties';
import {
  FormDefinitionFieldsForEditorFragment,
  FormDefinitionJson,
  FormItem,
} from '@/types/gqlTypes';

interface Props {
  item?: FormItem;
  definition: FormDefinitionFieldsForEditorFragment;
  onSuccess: (updatedForm: FormDefinitionJson) => void;
  onDiscard: () => void;
  onClose: () => void;
}

const FormItemDrawer: React.FC<Props> = ({
  item,
  definition,
  onSuccess,
  onDiscard,
  onClose,
}) => {
  // This piece of state is updated by a useEffect inside of the editor
  // which listens to RHF's isDirty state. This is so that we can move the `useForm`
  // call down into the FormItemEditor component, where `item` is guaranteed to
  // be non-null, but still prevent closing the drawer without saving when the
  // form is dirty. All this in service of a smooth transition on drawer open/close!
  const [isDirty, setDirty] = useState(false);

  return (
    <Drawer
      open={!!item}
      onClose={(_event, reason) => {
        // allow closing the drawer on backdrop click if the form is not dirty
        if (reason === 'backdropClick' && !isDirty) {
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
      {item && (
        <FormEditorItemProperties
          initialItem={item}
          definition={definition}
          onDiscard={onDiscard}
          onSuccess={onSuccess}
          setDirty={setDirty}
        />
      )}
    </Drawer>
  );
};

export default FormItemDrawer;
