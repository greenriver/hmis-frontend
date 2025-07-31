import { Box, Chip, Tooltip } from '@mui/material';
import React from 'react';

interface Props {
  items: string[];
}

const CommonTruncatedList: React.FC<Props> = ({ items }) => {
  if (items.length === 0) return null;

  const first = items[0];
  const rest = items.slice(1);

  return (
    <Box
      display='flex'
      flexDirection='row'
      alignItems='center'
      gap={0.5}
      aria-label={items.join(', ')}
    >
      {first}{' '}
      {rest.length > 0 && (
        <Tooltip arrow title={rest.join(', ')}>
          <Chip
            sx={{ cursor: 'pointer' }}
            size='small'
            label={`+${rest.length} more`}
          />
        </Tooltip>
      )}
    </Box>
  );
};

export default CommonTruncatedList;
