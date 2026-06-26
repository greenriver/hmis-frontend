import { Control, UseFormSetValue } from 'react-hook-form';

import type { CeMatchRuleFormValues } from '../ceMatchRuleFormUtil';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { CeMatchRuleFieldSource } from '@/types/gqlTypes';

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
const CeMatchClauseFieldSourceSelect: React.FC<Props> = ({
  control,
  setValue,
  clausePath,
  onSourceChange,
}) => (
  <ControlledSelect
    name={`${clausePath}.source`}
    control={control}
    label={getRequiredLabel('Field Type', true)}
    placeholder='Select type'
    required
    options={[
      {
        code: CeMatchRuleFieldSource.Client,
        label: 'Client field',
      },
      {
        code: CeMatchRuleFieldSource.CustomDataElement,
        label: 'Custom assessment field',
      },
    ]}
    onChange={(value) => {
      setValue(`${clausePath}.source`, value as CeMatchRuleFieldSource | '');
      onSourceChange();
    }}
  />
);

export default CeMatchClauseFieldSourceSelect;
