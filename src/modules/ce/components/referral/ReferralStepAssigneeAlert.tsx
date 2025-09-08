import { Alert } from '@mui/material';
import React from 'react';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
  canAssignReferralTasks?: boolean;
}

const ReferralStepAssigneeAlert: React.FC<Props> = ({
  step,
  canAssignReferralTasks,
}) => {
  const { status, assignees, swimlane } = step;

  const showAlert =
    [CeReferralStepStatus.Available, CeReferralStepStatus.InProgress].includes(
      status
    ) &&
    assignees.length === 0 &&
    canAssignReferralTasks;

  if (showAlert) {
    return (
      <Alert severity='error'>
        This step is available, but there are no {swimlane} contacts to assign.
      </Alert>
    );
  }
};

export default ReferralStepAssigneeAlert;
