import { Control, UseFormSetValue } from 'react-hook-form';

import type {
  CeMatchFieldSource,
  CeMatchRuleFormValues,
} from './ceMatchRuleFormUtil';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';

type ClausePath = `structuredExpression.clauses.${number}`;

interface Props {
  control: Control<CeMatchRuleFormValues>;
  setValue: UseFormSetValue<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  onSourceChange: () => void;
}

/**
 * Dropdown for selecting whether a CE Match Rule clause should use a client field
 * or a custom assessment field.
 */
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
    onChange={(value) => {
      setValue(`${clausePath}.source`, value as CeMatchFieldSource | '');
      onSourceChange();
    }}
  />
);

export default CeMatchFieldTypeSelect;
