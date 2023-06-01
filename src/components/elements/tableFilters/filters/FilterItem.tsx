import DatePicker from '../../input/DatePicker';
import TextInput from '../../input/TextInput';
import LabelWithContent from '../../LabelWithContent';

import TableFilterItemCheckboxes from './items/Checkboxes';
import PickListWrapper from './items/PickListWrapper';
import TableFilterItemSelect from './items/Select';

import { FilterType, SelectElementVariant } from '@/modules/dataFetching/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { PickListOption } from '@/types/gqlTypes';

export interface TableFilterItemSelectorProps {
  variant?: SelectElementVariant;
  options: PickListOption[];
  value: string | string[] | null | undefined;
  onChange: (value: string | string[] | null | undefined) => any;
  loading?: boolean;
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
    <LabelWithContent label={filter.label || keyName}>
      {(() => {
        if (filter.type === 'text')
          return (
            <TextInput
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          );

        if (filter.type === 'date')
          return (
            <DatePicker
              value={value ? new Date(value) : null}
              onChange={(val) => onChange(val)}
            />
          );

        if (filter.type === 'enum')
          return (
            <TableFilterItemSelector
              variant={filter.variant}
              options={localResolvePickList(filter.enumType, true) || []}
              value={filter.multi ? value || [] : value}
              onChange={onChange}
            />
          );

        if (filter.type === 'picklist')
          return (
            <PickListWrapper
              pickListType={filter.pickListReference}
              relationId={filter.relationId}
            >
              {(options, loading) => (
                <TableFilterItemSelector
                  loading={loading}
                  variant={filter.variant}
                  options={options}
                  value={filter.multi ? value || [] : value}
                  onChange={onChange}
                />
              )}
            </PickListWrapper>
          );

        return 'Not Implemented';
      })()}
    </LabelWithContent>
  );
};

export default TableFilterItem;
