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

  if (
    [ItemType.Choice, ItemType.OpenChoice].includes(field.itemType) ||
    // unexpected: we should only have options for Choice/OpenChoice fields,
    // but just in case, always use a select if we found options
    options.length
  ) {
    return 'choice';
  }

  return 'text';
};

/**
 * Value control for a CE Match Rule clause. Renders a select or text input based
 * on the selected field's item type and pick-list metadata.
 */
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
        // Represent empty/unselected as '', otherwise clearing the select would become
        // `false`, which is a valid submitted JSON value.
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
