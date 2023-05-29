import AddIcon from '@mui/icons-material/Add';
import { Box, Button, lighten, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface Props<T> {
  values: T[];
  renderChild: (val: T, index: number) => ReactNode;
  onClickAdd: VoidFunction;
  removeAt: (val: T, index: number) => VoidFunction | undefined;
  addText?: string;
  removeText?: string;
  id?: string;
  valueKey: (val: T) => string;
}

const RepeatedInputContainer = <T extends object>({
  values,
  renderChild,
  onClickAdd,
  removeAt,
  addText,
  removeText,
  id,
  valueKey,
}: Props<T>) => {
  return (
    <Stack id={id} gap={2}>
      {values.map((val, idx) => {
        return (
          <Box
            key={valueKey(val)}
            sx={{
              p: 2,
              backgroundColor: (theme) => lighten(theme.palette.grey[50], 0.4),
              borderRadius: 1,
            }}
          >
            {renderChild(val, idx)}
            <Button
              onClick={removeAt(val, idx)}
              color='error'
              variant='text'
              disabled={!removeAt(val, idx)}
              sx={{
                color: 'error.dark',
                width: 'fit-content',
                textDecoration: 'underline',
                py: 0,
                mt: 2,

                ml: -1,
              }}
            >
              {removeText || 'Remove'}
            </Button>
          </Box>
        );
      })}
      <Button
        onClick={onClickAdd}
        color='secondary'
        variant='outlined'
        sx={{ width: 'fit-content', px: 4 }}
        startIcon={<AddIcon />}
      >
        {addText || 'Add'}
      </Button>
    </Stack>
  );
};

export default RepeatedInputContainer;
