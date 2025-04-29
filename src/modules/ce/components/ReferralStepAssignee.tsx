import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import React, { Fragment, useMemo } from 'react';
import { CeReferralStepSummaryFieldsFragment } from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
}
const ReferralStepAssignee: React.FC<Props> = ({ step }) => {
  const { swimlane, assignees = [] } = step;
  const { participants } = swimlane || {};

  const content = useMemo(() => {
    // Assignees are the user(s) currently assigned to this step.
    // (For example, a user who clicked "start step" already)
    if (assignees.length > 0) {
      return assignees.map((assignee) => {
        return (
          <Fragment key={assignee.id}>
            <Chip size='small' label={assignee.name} />{' '}
          </Fragment>
        );
      });
    }

    // Participants are users who are contacts on this step's swimlane.
    // (For example, a user who was added using the Assign Contacts modal.
    // They may not have interacted with this particular step at all yet.)
    if (participants && participants.length > 0) {
      return participants.map((participant) => {
        return (
          <Fragment key={participant.id}>
            <Chip size='small' label={participant.name} />{' '}
          </Fragment>
        );
      });
    }

    return <Chip size='small' label={swimlane.name} />;
  }, [participants, swimlane, assignees]);

  return (
    <Typography component='div' variant='body2'>
      <strong>Assigned</strong> {content}
    </Typography>
  );
};

export default ReferralStepAssignee;
