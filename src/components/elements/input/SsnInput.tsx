import { TextField, TextFieldProps } from '@mui/material';
import { Box } from '@mui/system';
import { isNil, padEnd, padStart } from 'lodash-es';
import { useMemo } from 'react';

import LabelWithContent from '../LabelWithContent';
import MultiFieldInput from '../MultiFieldInput';

import { DynamicInputCommonProps } from '@/modules/form/types';

type SsnInputProps = {
  onChange?: (value: string | null) => any;
  onlylast4?: boolean;
  value?: string | null;
} & Omit<TextFieldProps, 'onChange' | 'value'> &
  DynamicInputCommonProps;

const SsnInput = ({
  inputProps,
  InputProps,
  value,
  label,
  onChange,
  helperText,
  onlylast4 = false,
  warnIfEmptyTreatment,
  ariaLabel,
  ...props
}: SsnInputProps) => {
  const baseInputProps: TextFieldProps = {
    inputProps: {
      // FIXME: switch to string input, allow use to type "X" or "x"
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
    } else if (!isNil(inputStr) && inputStr !== '') {
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
            placeholder: 'XXX',
            // Allow pasting into first box to fill the entire SSN
            onPaste: (event) => {
              const pasted = event.clipboardData.getData('text/plain');
              if (!pasted) return;
              let val = pasted.replace(/[^\dX]/g, '').substring(0, 9);
              if (val.length > 3) {
                val = padEnd(val, 9, 'X');
                if (val && onChange) onChange(val);
              }
            },
          },
        },
        {
          name: 'second',
          chars: 2,
          inputProps: {
            ...baseInputProps,
            disabled: onlylast4 ? true : false,
            placeholder: 'XX',
          },
        },
        {
          name: 'third',
          chars: 4,
          inputProps: {
            ...baseInputProps,
            placeholder: 'XXXX',
          },
        },
      ]}
      values={values}
      onChange={(values) =>
        onChange &&
        onChange(
          values.first || values.second || values.third
            ? [
                padEnd((values.first || '').replace(/[^\dX]/g, ''), 3, 'X'),
                padEnd((values.second || '').replace(/[^\dX]/g, ''), 2, 'X'),
                padEnd((values.third || '').replace(/[^\dX]/g, ''), 4, 'X'),
              ].join('')
            : null
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
            InputProps={{
              sx: {
                backgroundColor: warnIfEmptyTreatment
                  ? 'alerts.low.background'
                  : undefined,
              },
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
