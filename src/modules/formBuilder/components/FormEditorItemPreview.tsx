import { Typography } from '@mui/material';
import React, { useState } from 'react';
import CommonToggle from '@/components/elements/CommonToggle';
import {
  PreviewMode,
  toggleItems,
} from '@/modules/admin/components/forms/FormPreview';
import DynamicField from '@/modules/form/components/DynamicField';
import DynamicViewField from '@/modules/form/components/viewable/DynamicViewField';
import { FormItem, ItemType } from '@/types/gqlTypes';

interface FormEditorItemPreviewProps {
  selectedItem: FormItem;
  value?: any;
  setValue: (value: any) => void;
}

const FormEditorItemPreview: React.FC<FormEditorItemPreviewProps> = ({
  selectedItem,
  value,
  setValue,
}) => {
  const [toggleValue, setToggleValue] = useState<PreviewMode>('input');

  if (selectedItem.type === ItemType.Group) return;

  return (
    <>
      <Typography>Preview</Typography>
      <CommonToggle
        value={toggleValue}
        onChange={setToggleValue}
        items={toggleItems}
        size='small'
        variant='gray'
      />
      {toggleValue === 'readOnly' ? (
        <DynamicViewField item={selectedItem} value={value} />
      ) : (
        <DynamicField
          value={value}
          item={selectedItem}
          itemChanged={({ value }) => setValue(value)}
        />
      )}
    </>
  );
};

export default FormEditorItemPreview;
