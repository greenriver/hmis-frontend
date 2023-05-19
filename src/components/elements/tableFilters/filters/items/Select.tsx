import React from 'react';

import { TableFilterItemSelectorProps } from '../FilterItem';

import CreatableFormSelect from '@/modules/form/components/CreatableFormSelect';

const TableFilterItemSelect: React.FC<
  Omit<TableFilterItemSelectorProps, 'variant'>
> = ({ options, value, onChange, loading }) => {
  // This is repetative, but need to use a non-conditional value for the `multiple` prop for the types to work out
  if (Array.isArray(value)) {
    return (
      <CreatableFormSelect
        multiple
        value={options.filter((opt) => value.includes(opt.code))}
        options={options || []}
        onChange={(e, val) =>
          onChange(val.map((v) => (typeof v === 'string' ? v : v.code)))
        }
        getOptionLabel={(opt) =>
          typeof opt === 'string' ? opt : opt.label || opt.code
        }
        loading={loading}
        label={null}
      />
    );
  }
  return (
    <CreatableFormSelect
      value={options.find((opt) => value === opt.code) || ''}
      options={options || []}
      onChange={(e, val) =>
        onChange(val ? (typeof val === 'string' ? val : val.code) : val)
      }
      getOptionLabel={(opt) =>
        typeof opt === 'string' ? opt : opt.label || opt.code
      }
      loading={loading}
      multiple={false}
      label={null}
    />
  );
};

export default TableFilterItemSelect;
