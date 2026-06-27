import { useMemo } from 'react';
import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from '../ceMatchRuleFormUtil';
import { getRequiredLabel } from '@/modules/form/components/RequiredLabel';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { CeMatchFieldDetailsFragment } from '@/types/gqlTypes';

type ClausePath = `structuredExpression.clauses.${number}`;

interface Props {
  control: Control<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  fields: CeMatchFieldDetailsFragment[];
  fieldLabel: string;
  disabled: boolean;
  helperText?: string;
  customAssessmentFieldsLoading: boolean;
  onFieldChange: (field?: CeMatchFieldDetailsFragment) => void;
}

/**
 * Dropdown for selecting the field for a CE Match Rule clause:
 * either a client field, or a field from a custom assessment form.
 */
const CeMatchClauseFieldSelect: React.FC<Props> = ({
  control,
  clausePath,
  fields,
  fieldLabel,
  disabled,
  helperText,
  customAssessmentFieldsLoading,
  onFieldChange,
}) => {
  const fieldOptions = useMemo(
    () =>
      fields.map((field) => {
        return {
          code: field.expressionField,
          // field.label is derived from the form item label, which may be blank.
          // Fall back to stable expression identifiers just in case.
          label: field.label.trim() || field.expressionField || field.key,
        };
      }),
    [fields]
  );

  return (
    <ControlledSelect
      name={`${clausePath}.field`}
      control={control}
      label={getRequiredLabel(fieldLabel, true)}
      placeholder='Select field'
      required
      options={fieldOptions}
      disabled={disabled}
      loading={customAssessmentFieldsLoading}
      helperText={helperText}
      onChange={(value) => {
        onFieldChange(fields.find((field) => field.expressionField === value));
      }}
    />
  );
};

export default CeMatchClauseFieldSelect;
