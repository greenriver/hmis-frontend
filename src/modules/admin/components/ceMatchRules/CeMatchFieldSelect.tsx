import { useMemo } from 'react';
import { Control } from 'react-hook-form';

import type {
  CeMatchFieldSource,
  CeMatchRuleFormValues,
} from './ceMatchRuleFormUtil';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { CeMatchFieldDetailsFragment } from '@/types/gqlTypes';

type ClausePath = `structuredExpression.clauses.${number}`;

interface Props {
  control: Control<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  source: CeMatchFieldSource | '';
  selectedCustomAssessmentFormIdentifier: string;
  clientItems: CeMatchFieldDetailsFragment[];
  customAssessmentFields: CeMatchFieldDetailsFragment[];
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
  source,
  selectedCustomAssessmentFormIdentifier,
  clientItems,
  customAssessmentFields,
  customAssessmentFieldsLoading,
  onFieldChange,
}) => {
  const fields = useMemo(() => {
    if (source === 'client') return clientItems;
    if (source === 'custom') return customAssessmentFields;
    return [];
  }, [clientItems, source, customAssessmentFields]);

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
      label={source === 'client' ? 'Client Field' : 'Custom Field'}
      placeholder='Select field'
      options={fieldOptions}
      disabled={
        !source ||
        (source === 'custom' && !selectedCustomAssessmentFormIdentifier)
      }
      loading={customAssessmentFieldsLoading}
      onChange={(value) => {
        onFieldChange(fields.find((field) => field.expressionField === value));
      }}
    />
  );
};

export default CeMatchFieldSelect;
