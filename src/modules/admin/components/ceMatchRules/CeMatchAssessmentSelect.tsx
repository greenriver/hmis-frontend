import { useMemo } from 'react';
import { Control } from 'react-hook-form';

import type { CeMatchRuleFormValues } from './CeMatchRuleForm';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import { CeMatchCustomAssessmentFormFieldsFragment } from '@/types/gqlTypes';

type ClausePath = `structuredExpression.clauses.${number}`;

interface Props {
  control: Control<CeMatchRuleFormValues>;
  clausePath: ClausePath;
  customAssessmentForms: CeMatchCustomAssessmentFormFieldsFragment[];
  onAssessmentChange: () => void;
}

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
      shouldUnregister={false}
      onChange={onAssessmentChange}
    />
  );
};

export default CeMatchAssessmentSelect;
