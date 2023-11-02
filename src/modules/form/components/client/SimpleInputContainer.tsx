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

const SimpleInputContainer = <T extends object>({
  values,
  renderChild,
  id,
  renderMetadata,
  valueKey,
  title,
}: Props<T>) => {
  return (
    <Box pl={2} mt={4} mb={2}>
      {title}
      <Stack id={id} gap={2} divider={<Divider />}>
        {values.map((val, idx) => {
          const metadata = renderMetadata ? renderMetadata(val) : undefined;
          return (
            <div key={valueKey(val)}>
              {renderChild(val, idx)}
              {metadata && (
                <Typography variant='body2' mt={2}>
                  {metadata}
                </Typography>
              )}
            </div>
          );
        })}
      </Stack>
    </Box>
  );
};

export default SimpleInputContainer;
