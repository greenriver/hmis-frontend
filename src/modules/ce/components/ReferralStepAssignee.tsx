import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import React, { Fragment, useMemo } from 'react';
import { CeReferralStepSummaryFieldsFragment } from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
}
const ReferralStepAssignee: React.FC<Props> = ({ step }) => {
  const { swimlane, assignees = [] } = step;
  const { participants } = swimlane;

  const content = useMemo(() => {
    if (!swimlane) return null;

    if (assignees && assignees.length > 0) {
      return assignees.map((assignee) => {
        return (
          <Fragment key={assignee.id}>
            <Chip size='small' label={assignee.name} />{' '}
          </Fragment>
        );
      });
    }

    if (participants.length > 0) {
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

  if (swimlane)
    return (
      <Typography component='div' variant='body2'>
        <strong>Assigned</strong> {content}
      </Typography>
    );
};

export default ReferralStepAssignee;
