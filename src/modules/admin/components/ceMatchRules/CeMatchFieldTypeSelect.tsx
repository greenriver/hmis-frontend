import { Control, UseFormSetValue } from 'react-hook-form';

import type {
  CeMatchFieldSource,
  CeMatchRuleFormValues,
} from './CeMatchRuleForm';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { PickListOption } from '@/types/gqlTypes';

type ClausePath = `structuredExpression.clauses.${number}`;

interface Props {
  control: Control<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  onSourceChange: () => void;
}

// ControlledSelect can emit booleans for JSON-valued fields; only string values
// are safe to reuse as select option codes for form state.
const optionCode = (value: PickListOption['code'] | boolean | null) => {
  if (typeof value === 'string') return value;
};

const CeMatchFieldTypeSelect: React.FC<Props> = ({
  control,
  setValue,
  clausePath,
  onSourceChange,
}) => (
  <ControlledSelect
    name={`${clausePath}.source`}
    control={control}
    label='Field Type'
    placeholder='Select type'
    options={[
      { code: 'client', label: 'Client field' },
      { code: 'custom', label: 'Custom field' },
    ]}
    shouldUnregister={false}
    onChange={(value) => {
      const nextSource = optionCode(value) || '';
      setValue(`${clausePath}.source`, nextSource as CeMatchFieldSource | '');
      onSourceChange();
    }}
  />
);

export default CeMatchFieldTypeSelect;
