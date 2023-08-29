import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';
import { TableFilterItemSelectorProps } from './types';

const TableFilterItemCheckboxes: React.FC<
  Omit<TableFilterItemSelectorProps, 'variant'>
> = ({ options, value, onChange }) => {
  return (
    <>
      {options.map((option) => (
        <FormControlLabel
          label={option.label || option.code}
          control={
            <Checkbox
              size='small'
              onChange={(e, val) => {
                if (Array.isArray(value)) {
                  onChange(
                    val
                      ? [...value, option.code]
                      : value.filter((v) => v !== option.code)
                  );
                } else {
                  onChange(option.code);
                }
              }}
              checked={
                Array.isArray(value)
                  ? value.includes(option.code)
                  : option.code === value
              }
            />
          }
        />
      ))}
    </>
  );
};

export default TableFilterItemCheckboxes;
