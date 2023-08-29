import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Dispatch, SetStateAction, useCallback } from 'react';

export type DisplayType = 'table' | 'cards';

interface ClientDisplayTypeToggleProps {
  value: DisplayType;
  onChange: Dispatch<SetStateAction<DisplayType>>;
}
const ClientDisplayTypeToggle: React.FC<ClientDisplayTypeToggleProps> = ({
  value,
  onChange,
}) => {
  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, val: any) => {
      if (val) onChange(val as DisplayType);
    },
    [onChange]
  );
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={handleChange}
      aria-label='results display format'
    >
      <ToggleButton
        value='table'
        data-testid='tableToggleButton'
        aria-label='view as table'
        size='small'
        sx={{ px: 2 }}
      >
        <ViewHeadlineIcon />
        <Box sx={{ pl: 1 }}>Table</Box>
      </ToggleButton>
      <ToggleButton
        value='cards'
        data-testid='cardToggleButton'
        aria-label='view as cards'
        size='small'
        sx={{ px: 2 }}
      >
        <ViewCompactIcon />
        <Box sx={{ pl: 1 }}>Cards</Box>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
export default ClientDisplayTypeToggle;
