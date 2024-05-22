import { Typography } from '@mui/material';
import React, { useState } from 'react';
import CommonToggle from '@/components/elements/CommonToggle';
import {
  PreviewMode,
  toggleItems,
} from '@/modules/admin/components/forms/FormPreview';
import DynamicField from '@/modules/form/components/DynamicField';
import DynamicViewField from '@/modules/form/components/viewable/DynamicViewField';
import { FormItem } from '@/types/gqlTypes';

interface FormEditorItemPreviewProps {
  item: FormItem;
  value?: any;
  setValue: (value: any) => void;
}

const FormEditorItemPreview: React.FC<FormEditorItemPreviewProps> = ({
  item,
  value,
  setValue,
}) => {
  const [toggleValue, setToggleValue] = useState<PreviewMode>('input');

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
      {toggleValue === 'readOnly' || item.readOnly ? (
        <DynamicViewField item={item} value={value} />
      ) : (
        <DynamicField
          value={value}
          item={item}
          itemChanged={({ value }) => setValue(value)}
        />
      )}
    </>
  );
};

export default FormEditorItemPreview;
