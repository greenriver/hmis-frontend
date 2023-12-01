import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { ButtonProps, Button, InputAdornment } from '@mui/material';
import { Dispatch, SetStateAction, useCallback } from 'react';
import TextInput, {
  TextInputProps,
} from '@/components/elements/input/TextInput';

const ClearSearchEndAdornmentButton: React.FC<
  Omit<ButtonProps, 'children'>
> = ({ onClick, ...props }) => (
  <InputAdornment position='end'>
    <Button
      variant='text'
      sx={{ color: 'text.disabled' }}
      startIcon={<ClearIcon />}
      onClick={onClick}
      {...props}
    >
      Clear Search
    </Button>
  </InputAdornment>
);

export interface CommonSearchInputProps
  extends Omit<TextInputProps, 'onChange' | 'value'> {
  value?: string;
  onChange: Dispatch<SetStateAction<string>>;
  size?: 'small' | 'medium';
  searchAdornment?: boolean;
  clearAdornment?: boolean;
  onClearSearch?: VoidFunction;
}

const CommonSearchInput: React.FC<CommonSearchInputProps> = ({
  value,
  onChange,
  searchAdornment,
  clearAdornment,
  onClearSearch,
  ...props
}) => {
  const handleClear = useCallback(() => {
    onChange('');
    if (onClearSearch) onClearSearch();
  }, [onChange, onClearSearch]);

  return (
    <TextInput
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      {...props}
      InputProps={{
        startAdornment: searchAdornment && (
          <InputAdornment position='start'>
            <SearchIcon color='disabled' />
          </InputAdornment>
        ),
        endAdornment: clearAdornment && value && (
          <ClearSearchEndAdornmentButton onClick={handleClear} />
        ),
        ...props.InputProps,
      }}
    />
  );
};

export default CommonSearchInput;
