import React, { ReactNode } from 'react';

import TextInput from '../../input/TextInput';
import LabelWithContent from '../../LabelWithContent';

import TableFilterItemCheckboxes from './items/Checkboxes';
import TableFilterItemSelect from './items/Select';

import { FilterType, SelectElementVariant } from '@/modules/dataFetching/types';

export interface TableFilterItemSelectorProps {
  variant?: SelectElementVariant;
  options: { value: string; label?: ReactNode }[];
  value: string | string[];
  onChange: (value: string | string[]) => any;
}

const TableFilterItemSelector = ({
  variant = 'select',
  ...props
}: TableFilterItemSelectorProps): JSX.Element => {
  if (variant === 'checkboxes') return <TableFilterItemCheckboxes {...props} />;
  if (variant === 'select') return <TableFilterItemSelect {...props} />;

  return <TableFilterItemSelect {...props} />;
};

export interface TableFilterItemProps<T> {
  keyName: string;
  filter: FilterType<T>;
  value: any;
  onChange: (value: any) => any;
}

const TableFilterItem = <T,>({
  keyName,
  filter,
  value,
  onChange,
}: TableFilterItemProps<T>): JSX.Element => {
  return (
    <LabelWithContent label={filter.title || keyName}>
      {(() => {
        if (filter.type === 'text')
          return (
            <TextInput
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          );

        if (filter.type === 'enum')
          return (
            <TableFilterItemSelector
              variant={filter.variant}
              options={Object.entries(filter.enumType).map(([key, val]) => ({
                value: key,
                label: val,
              }))}
              value={filter.multi ? value || [] : value}
              onChange={onChange}
            />
          );

        return 'Not Implemented';
      })()}
    </LabelWithContent>
  );
};

export default TableFilterItem;
