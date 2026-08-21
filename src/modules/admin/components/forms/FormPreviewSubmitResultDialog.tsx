import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import React from 'react';
import CodeTextBlock from '@/components/elements/CodeTextBlock';
import CommonDialog from '@/components/elements/CommonDialog';

interface Props {
  value?: object;
  onClose: () => void;
  onSaveToInitialValues: (value: object) => void;
}

const FormPreviewSubmitResultDialog: React.FC<Props> = ({
  value,
  onClose,
  onSaveToInitialValues,
}) => {
  return (
    <CommonDialog open={!!value} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>Submitted Values</DialogTitle>
      <DialogContent>
        <CodeTextBlock sx={{ mt: 2 }}>
          {JSON.stringify(value, null, 2)}
        </CodeTextBlock>
      </DialogContent>
      <DialogActions>
        <Button color='grayscale' onClick={onClose}>
          Close
        </Button>
        <Button
          onClick={() => {
            if (value) onSaveToInitialValues(value);
            onClose();
          }}
        >
          Save to Initial Values
        </Button>
      </DialogActions>
    </CommonDialog>
  );
};

export default FormPreviewSubmitResultDialog;
