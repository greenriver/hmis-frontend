import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Divider, Grid, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface Props<T> {
  values: T[];
  renderChild: (val: T, index: number) => ReactNode;
  renderMetadata?: (val: T) => ReactNode;
  onClickAdd: VoidFunction;
  removeAt: (val: T, index: number) => VoidFunction | undefined;
  addText?: string;
  removeText?: string;
  id?: string;
  valueKey: (val: T) => string;
  title?: ReactNode;
}

const RepeatedInputContainer = <T extends object>({
  values,
  renderChild,
  onClickAdd,
  removeAt,
  addText,
  removeText,
  id,
  renderMetadata,
  valueKey,
  title,
}: Props<T>) => {
  const addButton = (
    <Button
      onClick={onClickAdd}
      color='secondary'
      variant='text'
      sx={{ width: 'fit-content', color: 'links' }}
      startIcon={<AddIcon />}
    >
      {addText || 'Add'}
    </Button>
  );

  return (
    <Grid
      item
      sx={{
        mt: 2,
        '&::after': {
          content: '""',
          height: '1px',
          backgroundColor: 'borders.dark',
          mt: 3,
          display: 'block',
          width: 'calc(100% + 40px)',
          ml: '-20px',
        },
      }}
    >
      {title}
      {values.length > 0 && (
        <Stack id={id} gap={2} sx={{ pb: 2 }}>
          {values.map((val, idx) => {
            return (
              <Box key={valueKey(val)} sx={{ py: 1 }}>
                {renderChild(val, idx)}
                <Stack
                  justifyContent={'space-between'}
                  direction='row'
                  sx={{ mt: 3, fontSize: '.825rem' }}
                >
                  {renderMetadata ? (
                    renderMetadata(val) || <Box></Box>
                  ) : (
                    <Box></Box>
                  )}
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
                      ml: -1,
                      fontSize: 'inherit',
                    }}
                  >
                    {removeText || 'Remove'}
                  </Button>
                </Stack>
                {idx < values.length - 1 && <Divider sx={{ mt: 4 }} />}
              </Box>
            );
          })}
        </Stack>
      )}
      {addButton}
    </Grid>
  );
};

export default RepeatedInputContainer;
