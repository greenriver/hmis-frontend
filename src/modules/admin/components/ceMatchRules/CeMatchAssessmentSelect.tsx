import { useMemo } from 'react';
import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from './ceMatchRuleFormUtil';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { CeMatchCustomAssessmentFormFieldsFragment } from '@/types/gqlTypes';

type ClausePath = `structuredExpression.clauses.${number}`;

interface Props {
  control: Control<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  customAssessmentForms: CeMatchCustomAssessmentFormFieldsFragment[];
  onAssessmentChange: () => void;
}

/**
 * Dropdown for selecting the assessment form to pick custom fields from for a CE Match Rule.
 * Notifies the parent so stale field/value selections reset when the selected form is changed.
 */
const CeMatchAssessmentSelect: React.FC<Props> = ({
  control,
  clausePath,
  customAssessmentForms,
  onAssessmentChange,
}) => {
  const customAssessmentFormOptions = useMemo(
    () =>
      customAssessmentForms.map((form) => ({
        code: form.identifier,
        label: form.title,
      })),
    [customAssessmentForms]
  );

  return (
    <ControlledSelect
      name={`${clausePath}.customAssessmentFormIdentifier`}
      control={control}
      label='Assessment'
      placeholder='Select assessment'
      options={customAssessmentFormOptions}
      onChange={onAssessmentChange}
    />
  );
};

export default CeMatchAssessmentSelect;
