import {
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
} from '@mui/lab';
import { Typography } from '@mui/material';
import React, { useMemo } from 'react';
import MultilineTypography from '@/components/elements/MultilineTypography';
import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import {
  NotesIcon,
  ReferralAcceptedIcon,
  ReferralDeclinedIcon,
} from '@/components/elements/SemanticIcons';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeReferralAuditEventFieldsFragment,
  CeReferralAuditEventType,
  CeReferralNoteFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  auditEventOrNote:
    | CeReferralAuditEventFieldsFragment
    | CeReferralNoteFieldsFragment;
  lastItem?: boolean;
}

function isAuditEvent(
  event: CeReferralAuditEventFieldsFragment | CeReferralNoteFieldsFragment
): event is CeReferralAuditEventFieldsFragment {
  return event.__typename === 'CeReferralAuditEvent';
}
function isNote(
  event: CeReferralAuditEventFieldsFragment | CeReferralNoteFieldsFragment
): event is CeReferralNoteFieldsFragment {
  return event.__typename === 'CeReferralNote';
}

function auditEventDescription(
  auditEvent: CeReferralAuditEventFieldsFragment
): string {
  switch (auditEvent.type) {
    case CeReferralAuditEventType.CompleteStep:
      return `${auditEvent.stepName} Completed`;
    case CeReferralAuditEventType.RejectReferral:
      return 'Referral Declined';
    case CeReferralAuditEventType.StartReferral:
      return 'Referral Started';
    case CeReferralAuditEventType.AcceptReferral:
      return 'Referral Accepted';
    default:
      return HmisEnums.CeReferralAuditEventType[auditEvent.type];
  }
}

const ReferralTimelineItem: React.FC<Props> = ({
  auditEventOrNote,
  lastItem = false,
}) => {
  const title = useMemo(() => {
    if (isNote(auditEventOrNote)) {
      return 'Note'; //auditEventOrNote.note;
    }
    return auditEventDescription(auditEventOrNote);
  }, [auditEventOrNote]);

  const description = useMemo(() => {
    if (isNote(auditEventOrNote)) return auditEventOrNote.note;
    return null;
  }, [auditEventOrNote]);

  const Icon = useMemo(() => {
    if (isAuditEvent(auditEventOrNote)) {
      const auditEvent = auditEventOrNote;
      if (auditEvent.type === CeReferralAuditEventType.RejectReferral) {
        return ReferralDeclinedIcon;
      }
      return ReferralAcceptedIcon;
    }
    return NotesIcon;
  }, [auditEventOrNote]);

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color={isNote(auditEventOrNote) ? 'grey' : 'primary'}>
          <Icon fontSize='inherit' />
        </TimelineDot>
        {!lastItem && <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent sx={{ mt: 0.5, mb: lastItem ? 0 : 1.5 }}>
        <Typography variant='body1' fontWeight='bold'>
          {title}
        </Typography>
        {description && (
          <MultilineTypography variant='body2' sx={{ py: 0.5 }}>
            {description}
          </MultilineTypography>
        )}
        <Typography variant='body2' color='text.secondary'>
          <RelativeDateDisplay
            dateString={auditEventOrNote.createdAt}
            suffixText={
              auditEventOrNote.user
                ? `by ${auditEventOrNote.user.name}`
                : undefined
            }
          />
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
};

export default ReferralTimelineItem;
