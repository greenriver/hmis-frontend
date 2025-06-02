import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import React, { Fragment, useMemo } from 'react';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
}
const ReferralStepAssignee: React.FC<Props> = ({ step }) => {
  const { swimlane, assignees = [] } = step;

  const locked = step.status === CeReferralStepStatus.Unavailable;

  const commonChipSx = useMemo(() => {
    return {
      ...(locked
        ? { color: 'grayscale.main', backgroundColor: 'grayscale.surface' }
        : {}),
    };
  }, [locked]);

  const content = useMemo(() => {
    // Assignees are the user(s) currently assigned to this step.
    // (For example, a user who clicked "start step" already)
    if (assignees.length > 0) {
      return assignees.map((assignee) => {
        return (
          <Fragment key={assignee.id}>
            <Chip sx={commonChipSx} label={assignee.name} />{' '}
          </Fragment>
        );
      });
    }

    return <Chip sx={commonChipSx} label={swimlane} />;
  }, [assignees, commonChipSx, swimlane]);

  return (
    <Typography component='div' variant='body2'>
      <strong>Assigned:</strong> {content}
    </Typography>
  );
};

export default ReferralStepAssignee;
