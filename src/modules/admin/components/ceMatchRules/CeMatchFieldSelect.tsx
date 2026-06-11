import { useMemo } from 'react';
import { Control } from 'react-hook-form';

import type {
  CeMatchFieldSource,
  CeMatchRuleFormValues,
} from './CeMatchRuleForm';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { CeMatchFieldDetailsFragment, PickListOption } from '@/types/gqlTypes';

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

// Field labels may be missing in older CDED metadata, so fall back to stable
// expression identifiers for the select option label.
const fieldLabel = (field: CeMatchFieldDetailsFragment) =>
  field.label.trim() || field.expressionField || field.key;

// ControlledSelect can emit booleans for JSON-valued fields; only string values
// are safe to reuse as select option codes for form state.
const optionCode = (value: PickListOption['code'] | boolean | null) => {
  if (typeof value === 'string') return value;
};

// This select maps both client and custom CDED fields into the same option shape.
const fieldToOption = (field: CeMatchFieldDetailsFragment): PickListOption => ({
  code: field.expressionField,
  label: fieldLabel(field),
});

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
    () => fields.map((field) => fieldToOption(field)),
    [fields]
  );

  return (
    <ControlledSelect
      name={`${clausePath}.field`}
      control={control}
      label={source === 'client' ? 'Client Field' : 'Custom Field'}
      placeholder='Select field'
      options={fieldOptions}
      shouldUnregister={false}
      disabled={
        !source ||
        (source === 'custom' && !selectedCustomAssessmentFormIdentifier)
      }
      loading={customAssessmentFieldsLoading}
      onChange={(value) => {
        const selectedFieldExpression = optionCode(value);
        onFieldChange(
          fields.find(
            (field) => field.expressionField === selectedFieldExpression
          )
        );
      }}
    />
  );
};

export default CeMatchFieldSelect;
