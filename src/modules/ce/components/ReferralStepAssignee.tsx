import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import React from 'react';
import { CeReferralStepSummaryFieldsFragment } from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
}
const ReferralStepAssignee: React.FC<Props> = ({ step }) => {
  const { swimlane } = step;

  if (swimlane)
    return (
      <Typography component='div' variant='body2'>
        <strong>Assigned</strong> <Chip label={swimlane} />
      </Typography>
    );
};

export default ReferralStepAssignee;
