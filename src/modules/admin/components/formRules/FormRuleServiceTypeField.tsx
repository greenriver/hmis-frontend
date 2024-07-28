import React from 'react';

import FormSelect from '@/modules/form/components/FormSelect';
import { usePickList } from '@/modules/form/hooks/usePickList';
import {
  FormRuleInput,
  ItemType,
  PickListOption,
  PickListType,
} from '@/types/gqlTypes';

interface Props {
  rule: FormRuleInput;
  onChange: (option: PickListOption | PickListOption[] | null) => void;
}

const FormRuleServiceTypeField: React.FC<Props> = ({ rule, onChange }) => {
  const value = rule.serviceTypeId;

  const { pickList: serviceTypePickList } = usePickList({
    item: {
      linkId: 'fake',
      type: ItemType.Choice,
      pickListReference: PickListType.AllServiceTypes,
    },
  });

  return (
    <>
      <FormSelect
        label='Service Type'
        sx={{ flexGrow: 1 }}
        value={value ? { code: value } : null}
        options={serviceTypePickList}
        onChange={(_event, option) => {
          onChange(option);
        }}
      />
    </>
  );
};

export default FormRuleServiceTypeField;
