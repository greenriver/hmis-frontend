import { TextField, TextFieldProps } from '@mui/material';
import { Box } from '@mui/system';
import { isNil, padEnd, padStart } from 'lodash-es';
import { useMemo } from 'react';

import LabelWithContent from '../LabelWithContent';
import MultiFieldInput from '../MultiFieldInput';

type SsnInputProps = {
  onChange?: (value: string) => any;
  onlylast4?: boolean;
} & Omit<TextFieldProps, 'onChange'>;

const SsnInput = ({
  inputProps,
  InputProps,
  value,
  label,
  onChange,
  helperText,
  onlylast4 = false,
  ...props
}: SsnInputProps) => {
  const baseInputProps: TextFieldProps = {
    inputProps: {
      inputMode: 'numeric',
      pattern: '[0-9]+',
      ...inputProps,
    },
    InputProps,
    ...props,
  };

  const values = useMemo(() => {
    const inputStr = String(value || '');
    let first = '';
    let second = '';
    let third = '';
    if (inputStr.match(/-/)) {
      [first, second, third] = inputStr.split('-');
    } else if (inputStr.match(/^[\dX]+$/)) {
      [, first, second, third] = padStart(inputStr, 9, 'X').match(
        /([\dX]{3})([\dX]{2})([\dX]{4})/
      ) || [null, '', '', ''];
      [first, second, third] = [first, second, third].map((str) =>
        str.replace(/X/g, '')
      );
    } else if (!isNil(inputStr)) {
      console.error(`Invalid input value "${inputStr}"`);
    }

    return {
      first: onlylast4 ? '✱✱✱' : first,
      second: onlylast4 ? '✱✱' : second,
      third,
    };
  }, [value, onlylast4]);

  return (
    <MultiFieldInput<TextFieldProps>
      inputs={[
        {
          name: 'first',
          chars: 3,
          inputProps: {
            ...baseInputProps,
            disabled: onlylast4 ? true : false,
          },
        },
        {
          name: 'second',
          chars: 2,
          inputProps: {
            ...baseInputProps,
            disabled: onlylast4 ? true : false,
          },
        },
        {
          name: 'third',
          chars: 4,
          inputProps: {
            ...baseInputProps,
          },
        },
      ]}
      values={values}
      onChange={(values) =>
        onChange &&
        onChange(
          [
            padEnd((values.first || '').replace(/[^\dX]/g, ''), 3, 'X'),
            padEnd((values.second || '').replace(/[^\dX]/g, ''), 2, 'X'),
            padEnd((values.third || '').replace(/[^\dX]/g, ''), 4, 'X'),
          ].join('')
        )
      }
      renderInputs={(inputs) => (
        <LabelWithContent label={label} helperText={helperText}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            {inputs.first.node}&#160;-&#160;{inputs.second.node}&#160;-&#160;
            {inputs.third.node}
          </Box>
        </LabelWithContent>
      )}
      renderInput={({ input, handlers, value, ref, key }) => {
        return (
          <TextField
            key={key}
            name={input.name}
            size='small'
            {...(input.inputProps || {})}
            inputProps={{
              ...input.inputProps?.inputProps,
              size: input.chars,
              ref,
            }}
            onChange={(e) => handlers.handleChange(e.target.value)}
            value={value}
          />
        );
      }}
    />
  );
};

export default SsnInput;
