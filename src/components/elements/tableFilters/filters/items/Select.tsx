import { MenuItem } from '@mui/material';
import React from 'react';

import { TableFilterItemSelectorProps } from '../FilterItem';

import TextInput from '@/components/elements/input/TextInput';

const TableFilterItemSelect: React.FC<
  Omit<TableFilterItemSelectorProps, 'variant'>
> = ({ options, value, onChange }) => {
  return (
    <TextInput select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.value || option.label}
        </MenuItem>
      ))}
    </TextInput>
  );
};

export default TableFilterItemSelect;
