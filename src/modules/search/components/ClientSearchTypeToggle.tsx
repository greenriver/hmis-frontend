import LocationSearchingIcon from '@mui/icons-material/LocationSearching';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { Dispatch, SetStateAction, useCallback } from 'react';
import LabelWithContent from '@/components/elements/LabelWithContent';

export type SearchType = 'broad' | 'specific';

interface ClientSearchTypeToggleProps {
  value: SearchType;
  onChange: Dispatch<SetStateAction<SearchType>>;
}

export const toggleButtonGroupSx: SxProps<Theme> = {
  border: (theme) => `1px solid ${theme.palette.borders.dark}`,
  backgroundColor: (theme) => theme.palette.background.paper,
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0.5,
    border: 0,
    px: 2,
    '&.Mui-selected, &.Mui-selected:hover': {
      backgroundColor: (theme) => theme.palette.primary.main,
      color: (theme) => theme.palette.primary.contrastText,
    },
    '&:not(:first-of-type)': {
      borderRadius: 1,
    },
    '&:first-of-type': {
      borderRadius: 1,
    },
  },
};

const ClientSearchTypeToggle: React.FC<ClientSearchTypeToggleProps> = ({
  value,
  onChange,
}) => {
  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, val: any) => {
      if (val) onChange(val as SearchType);
    },
    [onChange]
  );
  return (
    <LabelWithContent
      label='Search Type'
      LabelProps={{ sx: { fontSize: 16 } }}
      labelId='search-type-label'
      renderChildren={(labelElement) => (
        <ToggleButtonGroup
          value={value}
          exclusive
          onChange={handleChange}
          aria-label='search type'
          aria-labelledby={
            (labelElement && labelElement.getAttribute('id')) || undefined
          }
          sx={toggleButtonGroupSx}
        >
          <ToggleButton
            value='broad'
            data-testid='broadSearchToggleButton'
            aria-label='broad search'
          >
            <SearchIcon />
            <Box sx={{ pl: 1 }}>Broad Search</Box>
          </ToggleButton>
          <ToggleButton
            value='specific'
            data-testid='specificSearchToggleButton'
            aria-label='specific search'
          >
            <LocationSearchingIcon />
            <Box sx={{ pl: 1 }}>Specific Search</Box>
          </ToggleButton>
        </ToggleButtonGroup>
      )}
    />
  );
};
export default ClientSearchTypeToggle;
