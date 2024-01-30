import { Checkbox, FormControlLabel, Radio } from '@mui/material';
import { KeyboardEventHandler, useCallback, useId } from 'react';

import CommonHtmlContent from '@/components/elements/CommonHtmlContent';
import { PickListOption } from '@/types/gqlTypes';

interface Props {
  option: PickListOption;
  disabled?: boolean;
  onChange: (option: PickListOption) => void;
  variant: 'checkbox' | 'radio';
  checked: boolean;
}

const RadioGroupInputOption: React.FC<Props> = ({
  option,
  disabled = false,
  onChange,
  variant,
  checked,
}) => {
  const descriptionId = useId();
  const { code, label, helperText } = option;

  const ControlComponent = variant === 'checkbox' ? Checkbox : Radio;

  const handleClick = useCallback(
    (
      event:
        | React.MouseEvent<HTMLLabelElement>
        | React.KeyboardEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
      if (!disabled) onChange(option);
    },
    [onChange, disabled, option]
  );

  // Prevent form submission on Enter. Enter should toggle the state.
  const onKeyDown: KeyboardEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        handleClick(e);
      }
    },
    [handleClick]
  );

  return (
    <>
      <FormControlLabel
        data-testid={`option-${code}`}
        disabled={disabled}
        value={code}
        aria-label={label || code}
        onClick={handleClick}
        control={
          <ControlComponent
            disabled={disabled}
            onKeyDown={onKeyDown}
            data-checked={checked}
            aria-describedby={helperText ? descriptionId : undefined}
          />
        }
        checked={checked}
        label={label || code}
        componentsProps={{
          typography: {
            variant: 'body2',
            mr: 0.5,
            color: variant === 'checkbox' && !checked ? 'gray' : undefined,
          },
        }}
      />
      {helperText && (
        <CommonHtmlContent variant='body2' sx={{ ml: 4 }} id={descriptionId}>
          {helperText}
        </CommonHtmlContent>
      )}
    </>
  );
};

export default RadioGroupInputOption;
