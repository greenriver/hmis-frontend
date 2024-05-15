import { Drawer, Typography } from '@mui/material';
import { FormItem } from '@/types/gqlTypes';

interface FormItemEditorProps {
  selectedItem?: FormItem;
  handleClose: () => void;
}

const FormItemEditor: React.FC<FormItemEditorProps> = ({
  selectedItem,
  handleClose,
}) => {
  return (
    <Drawer
      open={!!selectedItem}
      onClose={handleClose}
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
      <Typography variant='cardTitle'>Edit Form Item</Typography>
    </Drawer>
  );
};

export default FormItemEditor;
