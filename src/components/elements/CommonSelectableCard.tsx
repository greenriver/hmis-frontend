import { Box, Paper, PaperProps, Radio, Stack } from '@mui/material';
import React from 'react';

export interface CommonSelectableCardProps extends PaperProps {
  selected?: boolean;
  onSelect: () => void;
  value: string; // the value of the radio group for this item
  ariaLabelledBy?: string;
}

/**
 * Card that has a radio button and can be selected from a group.
 */
const CommonSelectableCard: React.FC<CommonSelectableCardProps> = ({
  children,
  selected = false,
  onSelect,
  value,
  ariaLabelledBy,
  ...props
}) => {
  return (
    <Paper
      {...props}
      sx={{
        p: 2,
        backgroundColor: selected ? 'primary.surface' : 'background.paper',
        borderColor: selected ? 'primary.300' : 'divider',
      }}
    >
      <Stack direction='row' alignItems='center' gap={1}>
        <Radio
          checked={selected}
          onChange={onSelect}
          value={value}
          inputProps={{ 'aria-labelledby': ariaLabelledBy }}
        />
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
      </Stack>
    </Paper>
  );
};

export default CommonSelectableCard;
