import ClearIcon from '@mui/icons-material/Clear';
import { ButtonProps, Button } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import TextInput, { TextInputProps } from './input/TextInput';

export const ClearSearchEndAdornmentButton: React.FC<
  Omit<ButtonProps, 'children'>
> = ({ onClick, ...props }) => (
  <Button
    variant='text'
    sx={{ color: 'text.disabled', width: '200px' }}
    startIcon={<ClearIcon />}
    onClick={onClick}
    {...props}
  >
    Clear Search
  </Button>
);

export interface CommonSearchInputProps
  extends Omit<TextInputProps, 'onChange' | 'value'> {
  value?: string;
  onChange: Dispatch<SetStateAction<string | undefined>>;
  size?: 'small' | 'medium';
  hideAdornment?: boolean;
}

const CommonSearchInput: React.FC<CommonSearchInputProps> = ({
  hideAdornment,
  value,
  onChange,
  ...props
}) => {
  return (
    <TextInput
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        endAdornment: !hideAdornment && value && (
          <ClearSearchEndAdornmentButton onClick={() => onChange(undefined)} />
        ),
      }}
      {...props}
    />
  );
};

export default CommonSearchInput;
