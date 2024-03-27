import { SvgIconComponent } from '@mui/icons-material';
import {
  Box,
  SxProps,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from '@mui/material';

import { useCallback } from 'react';

type SupportedValue = string;

type CommonToggleVariant = 'primary' | 'gray';

export interface ToggleItem<T> {
  value: T;
  label: string;
  Icon?: SvgIconComponent;
  testId?: string;
}

export interface CommonToggleProps<T>
  extends Omit<ToggleButtonGroupProps, 'onChange' | 'value'> {
  value: T;
  onChange: (value: T) => void;
  items: ToggleItem<T>[];
  variant?: CommonToggleVariant;
  label?: string;
  ToggleButtonGroupProps?: ToggleButtonGroupProps;
  size?: 'small' | 'medium';
}

const primaryToggleSx: SxProps<Theme> = {
  border: (theme) => `1px solid ${theme.palette.borders.dark}`,
  backgroundColor: (theme) => theme.palette.background.paper,
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0.5,
    border: 0,
    px: { xs: 1, sm: 2 },
    py: { xs: 1, sm: '11px' }, // 11px is default coming from MUI
    '&.Mui-selected, &.Mui-selected:hover': {
      backgroundColor: (theme) => theme.palette.primary.main,
      color: (theme) => theme.palette.primary.contrastText,
    },
    '&:not(:first-of-type)': {
      borderRadius: 1,
      ml: '-1px', // Default coming from MUI, but clobbered by setting margin on the group above
    },
    '&:first-of-type': {
      borderRadius: 1,
    },
  },
};

const CommonToggle = <T extends SupportedValue>({
  items,
  value,
  onChange,
  variant = 'primary',
  size = 'medium',
  ...props
}: CommonToggleProps<T>) => {
  const handleChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, val: T) => {
      if (val) onChange(val);
    },
    [onChange]
  );

  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={handleChange}
      {...props}
      sx={{
        ...(variant === 'primary' ? primaryToggleSx : undefined),
        ...props?.sx,
      }}
    >
      {items.map(({ value: itemValue, label, Icon, testId }) => (
        <ToggleButton
          key={itemValue}
          value={itemValue}
          data-testid={testId}
          aria-label={label}
          size={size}
          sx={{ '&.MuiToggleButton-sizeSmall': { px: 2 } }}
        >
          {Icon && <Icon fontSize={size === 'small' ? 'small' : undefined} />}
          <Box
            component='span'
            sx={{
              pl: Icon ? 1 : undefined,
            }}
          >
            {label}
          </Box>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
export default CommonToggle;
