import DatePicker from '../../input/DatePicker';
import LabeledCheckbox from '../../input/LabeledCheckbox';
import TextInput from '../../input/TextInput';
import LabelWithContent from '../../LabelWithContent';

import TableFilterItemCheckboxes from './items/Checkboxes';
import PickListWrapper from './items/PickListWrapper';
import TableFilterItemSelect from './items/TableFilterItemSelect';

import { TableFilterItemSelectorProps } from './items/types';
import { FilterType, SelectElementVariant } from '@/modules/dataFetching/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { PickListOption } from '@/types/gqlTypes';

const TableFilterItemSelector = ({
  variant = 'select',
  ...props
}: TableFilterItemSelectorProps): JSX.Element => {
  if (variant === 'checkboxes') return <TableFilterItemCheckboxes {...props} />;
  if (variant === 'select') return <TableFilterItemSelect {...props} />;

  return <TableFilterItemSelect {...props} />;
};

const selectDefaultFilterVariant = (filter: {
  variant?: SelectElementVariant;
  pickListOptions?: PickListOption[];
  multi?: boolean;
}): SelectElementVariant => {
  return (
    filter.variant ||
    (filter.pickListOptions && filter.pickListOptions.length < 3 && filter.multi
      ? 'checkboxes'
      : 'select')
  );
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
  if (filter.type === 'boolean') {
    return (
      <LabeledCheckbox
        label={filter.label || keyName}
        checked={value || false}
        onChange={(e, checked) => onChange(checked)}
      />
    );
  }

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

        const placeholder =
          typeof filter.label === 'string'
            ? `Select ${filter.label}...`
            : undefined;

        if (filter.type === 'enum') {
          const options =
            filter.pickListOptions ||
            localResolvePickList(filter.enumType, true) ||
            [];
          const variant = selectDefaultFilterVariant(filter);
          return (
            <TableFilterItemSelector
              variant={variant}
              options={options}
              value={filter.multi ? value || [] : value}
              onChange={onChange}
              placeholder={placeholder}
            />
          );
        }

        if (filter.type === 'local_picklist') {
          const variant = selectDefaultFilterVariant(filter);
          return (
            <TableFilterItemSelector
              variant={variant}
              options={filter.pickListOptions}
              value={filter.multi ? value || [] : value}
              onChange={onChange}
              placeholder={placeholder}
            />
          );
        }

        if (filter.type === 'remote_picklist') {
          return (
            <PickListWrapper
              pickListType={filter.pickListReference}
              pickListArgs={filter.pickListArgs}
            >
              {(options, loading) => (
                <TableFilterItemSelector
                  loading={loading}
                  variant={filter.variant}
                  options={options}
                  value={filter.multi ? value || [] : value}
                  onChange={onChange}
                  placeholder={placeholder}
                />
              )}
            </PickListWrapper>
          );
        }
        return 'Not Implemented';
      })()}
    </LabelWithContent>
  );
};

export default TableFilterItem;
