import { Box, Skeleton } from '@mui/material';
import { BoxProps } from '@mui/system';
import times from 'lodash-es/times';
import React from 'react';

interface Props extends BoxProps {
  animation?: 'pulse' | 'wave' | false;
  count?: number;
  height?: number;
}
const LoadingSkeleton: React.FC<Props> = ({
  animation = 'wave',
  count = 6,
  height = 50,
  ...props
}) => {
  return (
    <Box aria-live='polite' aria-busy='true' {...props}>
      {times(count, (i) => (
        <Skeleton
          animation={animation}
          key={i}
          height={height}
          variant='rounded'
          sx={{ mb: 2 }}
        />
      ))}
    </Box>
  );
};

export default LoadingSkeleton;
