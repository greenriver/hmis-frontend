import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import TextInput from '@/components/elements/input/TextInput';
import { AddIcon } from '@/components/elements/SemanticIcons';
import { useCreateCeReferralNoteMutation } from '@/types/gqlTypes';

interface Props {
  referralId: string;
}

const AddReferralNoteButton: React.FC<Props> = ({ referralId }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [note, setNote] = useState('');
  const [createNote, { loading, error }] = useCreateCeReferralNoteMutation({
    onCompleted: () => {
      setDialogOpen(false);
      setNote('');
    },
  });

  if (error) throw error;

  return (
    <>
      <Box sx={{ px: 2, pt: 2 }}>
        <LoadingButton
          onClick={() => setDialogOpen(true)}
          fullWidth
          color='grayscale'
          startIcon={<AddIcon />}
        >
          Add New Note
        </LoadingButton>
      </Box>

      <CommonDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Add a Note</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextInput
            ariaLabel='Note'
            multiline
            rows={8}
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Stack gap={3} direction='row'>
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={loading}
              color='grayscale'
            >
              Cancel
            </Button>
            <LoadingButton
              onClick={() => createNote({ variables: { referralId, note } })}
              loading={loading}
              disabled={!note.trim()}
            >
              Submit Note
            </LoadingButton>
          </Stack>
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default AddReferralNoteButton;
