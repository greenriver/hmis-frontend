import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Grid, lighten, Stack } from '@mui/material';
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
      variant='outlined'
      sx={{ width: 'fit-content', px: 4 }}
      startIcon={<AddIcon />}
    >
      {addText || 'Add'}
    </Button>
  );
  if (values.length === 0) return <Box sx={{ mt: 1 }}>{addButton}</Box>;

  return (
    <Grid
      item
      sx={{
        '&::after': {
          content: '""',
          height: '1px',
          backgroundColor: 'borders.light',
          mt: 4,
          mb: 2,
          display: 'block',
        },
      }}
    >
      {title}
      <Stack id={id} gap={4} sx={{ pb: 2 }}>
        {values.map((val, idx) => {
          return (
            <Box
              key={valueKey(val)}
              sx={{
                py: 2,
                px: 3,
                backgroundColor: lighten('#D7D7D7', 0.95),
                borderRadius: 1,
                borderColor: 'borders.light',
                borderStyle: 'solid',
                borderWidth: 1,
              }}
            >
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
            </Box>
          );
        })}
      </Stack>
      {addButton}
    </Grid>
  );
};

export default RepeatedInputContainer;
