import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from './CeMatchRuleForm';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import {
  CeMatchFieldDetailsFragment,
  ItemType,
  PickListOption,
} from '@/types/gqlTypes';

type ClausePath = `structuredExpression.clauses.${number}`;
type ValueInputType = 'boolean' | 'choice' | 'date' | 'number' | 'text';

interface Props {
  control: Control<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  selectedField?: CeMatchFieldDetailsFragment;
}

const pickListOptionsForField = (
  field?: CeMatchFieldDetailsFragment
): PickListOption[] => {
  if (!field) return [];

  // Keep CE match CDED metadata aligned with FormItem: enum references are
  // resolved by the frontend, while backend pick list references are not
  // expanded here. If historical form versions used a different reference, the
  // free-text expression builder can still target those raw legacy values.
  if (field.pickListReference) {
    return localResolvePickList(field.pickListReference) || [];
  }

  return field.pickListOptions || [];
};

const valueInputType = (
  field: CeMatchFieldDetailsFragment | undefined,
  options: PickListOption[]
): ValueInputType => {
  if (!field) return 'text';
  if (field.itemType === ItemType.Boolean) return 'boolean';
  if ([ItemType.Integer, ItemType.Currency].includes(field.itemType))
    return 'number';
  if (field.itemType === ItemType.Date) return 'date';

  // Fields with enum references or inline options should use a select even when
  // the backend item type is not strictly Choice/OpenChoice.
  if (
    [ItemType.Choice, ItemType.OpenChoice].includes(field.itemType) ||
    options.length
  ) {
    return 'choice';
  }

  return 'text';
};

const CeMatchValueInput: React.FC<Props> = ({
  control,
  clausePath,
  selectedField,
}) => {
  const valueOptions = pickListOptionsForField(selectedField);
  const valueType = valueInputType(selectedField, valueOptions);

  if (valueType === 'choice') {
    return (
      <ControlledSelect
        name={`${clausePath}.value`}
        control={control}
        label='Value'
        placeholder='Select value'
        options={valueOptions}
        disabled={!selectedField}
        shouldUnregister={false}
      />
    );
  }

  if (valueType === 'boolean') {
    return (
      <ControlledSelect
        name={`${clausePath}.value`}
        control={control}
        label='Value'
        placeholder='Select value'
        options={[
          { code: 'true', label: 'True' },
          { code: 'false', label: 'False' },
        ]}
        disabled={!selectedField}
        // Empty must stay empty; otherwise clearing the select would become
        // false, which is a valid submitted JSON value.
        setValueAs={(option) => (option ? option.code === 'true' : '')}
        shouldUnregister={false}
      />
    );
  }

  return (
    <ControlledTextInput
      name={`${clausePath}.value`}
      control={control}
      label='Value'
      type={valueType}
      disabled={!selectedField}
      shouldUnregister={false}
    />
  );
};

export default CeMatchValueInput;
