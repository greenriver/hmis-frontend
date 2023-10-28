import { Box, Divider, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props<T> {
  values: T[];
  renderChild: (val: T, index: number) => ReactNode;
  renderMetadata?: (val: T) => ReactNode;
  id?: string;
  valueKey: (val: T) => string;
  title?: ReactNode;
}

const SingleInputContainer = <T extends object>({
  values,
  renderChild,
  id,
  renderMetadata,
  valueKey,
  title,
}: Props<T>) => {
  // FIXME: style crimes
  return (
    <Box pl={2} my={4}>
      {' '}
      {title}
      <Stack id={id} gap={2} divider={<Divider />}>
        {values.map((val, idx) => {
          const metadata = renderMetadata ? renderMetadata(val) : undefined;
          return (
            <Box key={valueKey(val)} sx={{ py: 1 }}>
              {renderChild(val, idx)}
              {metadata && (
                <Typography variant='body2' mt={2}>
                  {metadata}
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default SingleInputContainer;
