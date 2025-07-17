import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import { Typography } from '@mui/material';
import React from 'react';
import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import {
  ReferralAcceptedIcon,
  ReferralDeclinedIcon,
} from '@/components/elements/SemanticIcons';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeReferralAuditEventFieldsFragment,
  CeReferralAuditEventType,
} from '@/types/gqlTypes';

interface Props {
  auditEvent: CeReferralAuditEventFieldsFragment;
  lastItem?: boolean;
}

const ReferralTimelineItem: React.FC<Props> = ({
  auditEvent,
  lastItem = false,
}) => {
  let description = '';
  switch (auditEvent.type) {
    case CeReferralAuditEventType.CompleteStep:
      description = `${auditEvent.stepName} Completed`;
      break;
    case CeReferralAuditEventType.RejectReferral:
      description = 'Referral Declined';
      break;
    case CeReferralAuditEventType.StartReferral:
      description = 'Referral Started';
      break;
    case CeReferralAuditEventType.AcceptReferral:
      description = 'Referral Accepted';
      break;
    default:
      description = HmisEnums.CeReferralAuditEventType[auditEvent.type];
  }

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color='primary'>
          {auditEvent.type === CeReferralAuditEventType.RejectReferral ? (
            <ReferralDeclinedIcon fontSize='inherit' />
          ) : (
            <ReferralAcceptedIcon fontSize='inherit' />
          )}
        </TimelineDot>
        {!lastItem && <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant='body1' fontWeight='bold'>
          {description}
        </Typography>
        <Typography variant='body2' color='text.primary'>
          <RelativeDateDisplay dateString={auditEvent.createdAt} />
          {auditEvent.user?.name ? `by ${auditEvent.user.name}` : ''}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
};

export default ReferralTimelineItem;
