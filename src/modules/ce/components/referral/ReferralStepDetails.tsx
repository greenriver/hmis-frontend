import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import {
  AssigneesIcon,
  StepCalendarIcon,
} from '@/components/elements/SemanticIcons';
import ReferralStepDatum from '@/modules/ce/components/referral/ReferralStepDatum';
import {
  formatRelativeDate,
  parseHmisDateString,
  stringifyArray,
} from '@/modules/hmis/hmisUtil';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
} from '@/types/gqlTypes';

const ReferralStepDetails: React.FC<{
  step: CeReferralStepSummaryFieldsFragment;
}> = ({ step }) => {
  const { status, availableAt, updatedAt, assignees } = step;

  const dateText = useMemo(() => {
    if (status === CeReferralStepStatus.Unavailable) return;
    if (status === CeReferralStepStatus.Completed) {
      const date = parseHmisDateString(updatedAt);
      if (date) return `Completed ${formatRelativeDate(date)}`;
    }
    const date = parseHmisDateString(availableAt);
    if (date) return `Available ${formatRelativeDate(date)}`;
  }, [availableAt, updatedAt, status]);

  const assigneeText = useMemo(() => {
    if (assignees.length === 0) return;
    return `Assigned to ${stringifyArray(assignees.map(({ name }) => name))}`;
  }, [assignees]);

  return (
    <Box>
      {dateText && (
        <ReferralStepDatum Icon={StepCalendarIcon}>
          {dateText}
        </ReferralStepDatum>
      )}

      {assigneeText && (
        <ReferralStepDatum Icon={AssigneesIcon}>
          {assigneeText}
        </ReferralStepDatum>
      )}
    </Box>
  );
};

export default ReferralStepDetails;
