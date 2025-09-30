import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import {
  AssigneesIcon,
  ErrorIcon,
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
  const { status, availableAt, updatedAt, updatedBy, assignees } = step;
  const { user: currentUser } = useAuth();

  const dateText = useMemo(() => {
    if (status === CeReferralStepStatus.Unavailable) return;
    if (status === CeReferralStepStatus.Completed) {
      const date = parseHmisDateString(updatedAt);
      // intentionally format relative datetime as date (eg "Today" instead of "5 minutes ago")
      const user = updatedBy?.name || 'Unknown User';
      if (date) return `Completed ${formatRelativeDate(date)} by ${user}`;
    }
    const date = parseHmisDateString(availableAt);
    // intentionally format relative datetime as date (eg "Today" instead of "5 minutes ago")
    if (date) return `Available ${formatRelativeDate(date)}`;
  }, [status, availableAt, updatedAt, updatedBy]);

  const assigneeText = useMemo(() => {
    if (status === CeReferralStepStatus.Completed) return; // hide and show user who completed step instead
    if (status === CeReferralStepStatus.Unavailable) return; // hide to reduce confusion, no action can be taken
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
      {/* If step is available and has no assignees, show alert message */}
      {assignees.length === 0 &&
        [
          CeReferralStepStatus.Available,
          CeReferralStepStatus.InProgress,
        ].includes(status) && (
          <ButtonTooltipContainer
            title={`No users will be notified for this task until contacts are specified for the '${step.swimlane}' contact type.`}
            placement='top'
            arrow
          >
            <ReferralStepDatum
              Icon={ErrorIcon}
              color='error.dark'
              IconProps={{ color: 'error' }}
            >
              No assigned users
            </ReferralStepDatum>
          </ButtonTooltipContainer>
        )}
    </Box>
  );
};

export default ReferralStepDetails;
