import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import React, { Fragment, useMemo } from 'react';
import {
  CeReferralParticipantFieldsFragment,
  CeReferralStepSummaryFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
  participants: CeReferralParticipantFieldsFragment[];
}
const ReferralStepAssignee: React.FC<Props> = ({ step, participants }) => {
  const { swimlane } = step;

  const content = useMemo(() => {
    if (!swimlane) return null;

    let assignees;
    if (participants.length > 0) {
      assignees = participants
        .filter((participant) => participant.swimlane.name === swimlane)
        .map((participant) => {
          return (
            <Fragment key={participant.user.id}>
              <Chip size='small' label={participant.user.name} />{' '}
            </Fragment>
          );
        });
    }

    if (assignees && assignees.length > 0) return assignees;

    return <Chip size='small' label={swimlane} />;
  }, [participants, swimlane]);

  if (swimlane)
    return (
      <Typography component='div' variant='body2'>
        <strong>Assigned</strong> {content}
      </Typography>
    );
};

export default ReferralStepAssignee;
