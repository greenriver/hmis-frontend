import { Card, Typography } from '@mui/material';
import theme from '@/config/theme';
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
  return (
    <>
      <Typography>Preview</Typography>
      <Card sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
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
    </>
  );
};

export default FormEditorItemPreview;
