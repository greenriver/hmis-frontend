import React from 'react';

import FormSelect from '@/modules/form/components/FormSelect';
import { FormRuleInput, PickListOption } from '@/types/gqlTypes';

interface Props {
  rule: FormRuleInput;
  onChange: (option: PickListOption | PickListOption[] | null) => void;
  label: string;
  name: keyof FormRuleInput;
  options: PickListOption[];
}

const FormRuleSelectField: React.FC<Props> = ({
  label,
  rule,
  name,
  onChange,
  options,
}) => {
  const value = rule[name];

  return (
    <FormSelect
      label={label}
      sx={{ flexGrow: 1 }}
      value={value ? { code: value } : null}
      options={options}
      onChange={(_event, option) => {
        onChange(option);
      }}
    />
  );
};

export default FormRuleSelectField;
