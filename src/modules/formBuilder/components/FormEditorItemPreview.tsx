import { Card } from '@mui/material';
import { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { FormItemControl } from './itemEditor/types';
import theme from '@/config/theme';
import DynamicField from '@/modules/form/components/DynamicField';
import DynamicViewField from '@/modules/form/components/viewable/DynamicViewField';
import { FormItem } from '@/types/gqlTypes';

interface Props {
  control: FormItemControl;
}
export const FormEditorItemPreview: React.FC<Props> = ({ control }) => {
  // watch whole form. probably doesn't need to watch everything (like enablewhen, etc). can pass `name` to specify fields to watch
  const item = useWatch({ control }) as FormItem;

  // Local value (e.g. text entered into text box in preview)
  const [value, setValue] = useState<any>(undefined);

  // Clear value when item changes
  useEffect(() => {
    setValue(undefined);
  }, [item]);

  return (
    <Card
      sx={{
        p: 6,
        backgroundColor: theme.palette.grey[100],
        border: 'unset',
      }}
    >
      {item.readOnly ? (
        <DynamicViewField item={item} value={value} />
      ) : (
        <DynamicField
          value={value}
          item={item}
          itemChanged={({ value }) => setValue(value)}
        />
      )}
    </Card>
  );
};

export default FormEditorItemPreview;
