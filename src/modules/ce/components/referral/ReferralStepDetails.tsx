import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import {
  AssigneesIcon,
  StepCalendarIcon,
} from '@/components/elements/SemanticIcons';
import useAuth from '@/modules/auth/hooks/useAuth';
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
  const { user: currentUser } = useAuth();

  const dateText = useMemo(() => {
    if (status === CeReferralStepStatus.Unavailable) return;
    if (status === CeReferralStepStatus.Completed) {
      const date = parseHmisDateString(updatedAt);
      // intentionally format relative datetime as date (eg "Today" instead of "5 minutes ago")
      const user = step.updatedBy?.name || 'Unknown User';
      if (date) return `Completed ${formatRelativeDate(date)} by ${user}`;
    }
    const date = parseHmisDateString(availableAt);
    // intentionally format relative datetime as date (eg "Today" instead of "5 minutes ago")
    if (date) return `Available ${formatRelativeDate(date)}`;
  }, [status, availableAt, updatedAt, step.updatedBy?.name]);

  const assigneeText = useMemo(() => {
    if (status === CeReferralStepStatus.Completed) return;
    if (assignees.length === 0) return;

    const assigneeNames = assignees.map(({ id, name }) =>
      id === currentUser?.id ? 'you' : name
    );
    return `Assigned to ${stringifyArray(assigneeNames)}`;
  }, [assignees, currentUser?.id, status]);

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

      <ReferralStepDatum Icon={PeopleOutlineRoundedIcon}>
        {step.swimlane}
      </ReferralStepDatum>
    </Box>
  );
};

export default ReferralStepDetails;
