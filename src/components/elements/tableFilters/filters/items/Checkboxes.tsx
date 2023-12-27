import React, { useMemo } from 'react';
import { TableFilterItemSelectorProps } from './types';
import CheckboxGroupInput from '@/components/elements/input/CheckboxGroupInput';

const TableFilterItemCheckboxes: React.FC<
  Omit<TableFilterItemSelectorProps, 'variant'>
> = ({ options, value, onChange }) => {
  const selectedOptions = useMemo(() => {
    if (!value) return [];
    return options.filter((o) => value.includes(o.code));
  }, [options, value]);

  return (
    <CheckboxGroupInput
      options={options}
      value={selectedOptions}
      onChange={(opt) => onChange(opt?.map((o) => o.code))}
      row
    />
  );
};

export default TableFilterItemCheckboxes;
