import { useMemo } from 'react';
import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from './ceMatchRuleFormUtil';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { CeMatchFieldDetailsFragment } from '@/types/gqlTypes';

type ClausePath = `structuredExpression.clauses.${number}`;

interface Props {
  control: Control<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  fields: CeMatchFieldDetailsFragment[];
  fieldLabel: string;
  disabled: boolean;
  customAssessmentFieldsLoading: boolean;
  onFieldChange: (field?: CeMatchFieldDetailsFragment) => void;
}

/**
 * Dropdown for selecting the field for a CE Match Rule clause:
 * either a client field, or a field from a custom assessment form.
 */
const CeMatchFieldSelect: React.FC<Props> = ({
  control,
  clausePath,
  fields,
  fieldLabel,
  disabled,
  customAssessmentFieldsLoading,
  onFieldChange,
}) => {
  const fieldOptions = useMemo(
    () =>
      fields.map((field) => {
        return {
          code: field.expressionField,
          // Form item labels may be blank, so fall back to stable expression identifiers
          label: field.label.trim() || field.expressionField || field.key,
        };
      }),
    [fields]
  );

  return (
    <ControlledSelect
      name={`${clausePath}.field`}
      control={control}
      label={fieldLabel}
      placeholder='Select field'
      options={fieldOptions}
      disabled={disabled}
      loading={customAssessmentFieldsLoading}
      onChange={(value) => {
        onFieldChange(fields.find((field) => field.expressionField === value));
      }}
    />
  );
};

export default CeMatchFieldSelect;
