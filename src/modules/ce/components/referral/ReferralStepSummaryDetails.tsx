import { Stack } from '@mui/material';
import React from 'react';

import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import { customDataElementValueAsString } from '@/modules/hmis/hmisUtil';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
  DisplayHook,
} from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
}

const ReferralStepSummaryDetails: React.FC<Props> = ({ step }) => {
  if (step.status !== CeReferralStepStatus.Completed) return null;

  const summaryRows = step.customDataElements
    .filter((cde) => cde.displayHooks.includes(DisplayHook.TableSummary))
    .map((cde) => ({
      key: cde.key,
      label: cde.label,
      value: customDataElementValueAsString(cde),
    }))
    .filter((row) => !!row.value);

  if (summaryRows.length === 0) return null;

  return (
    <Stack gap={1}>
      {summaryRows.map((row) => (
        <CommonLabeledTextBlock key={row.key} title={`${row.label}:`}>
          {row.value}
        </CommonLabeledTextBlock>
      ))}
    </Stack>
  );
};

export default ReferralStepSummaryDetails;
