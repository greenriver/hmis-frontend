import { Timeline, timelineItemClasses } from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import AddReferralNoteButton from '@/modules/ce/components/referral/AddReferralNoteButton';
import ReferralTimelineItem from '@/modules/ce/components/referral/ReferralTimelineItem';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referral: Pick<
    CeReferralFieldsFragment,
    'auditEvents' | 'notes' | 'id' | 'access'
  >;
}

const ReferralTimeline: React.FC<Props> = ({ referral }: Props) => {
  const combinedEvents = useMemo(() => {
    // Combine audit events and notes into a single array, sorted by createdAt
    return [
      ...(referral.auditEvents?.nodes || []),
      ...(referral.notes?.nodes || []),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [referral.auditEvents?.nodes, referral.notes?.nodes]);

  return (
    <Stack
      direction='column'
      sx={{ height: '100vh', backgroundColor: 'background.default' }}
    >
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'borders.light',
        }}
      >
        {referral.access.canCreateReferralNote && (
          <AddReferralNoteButton referralId={referral.id} />
        )}
        <Timeline
          sx={{
            // https://mui.com/material-ui/react-timeline/#left-aligned-with-no-opposite-content
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {combinedEvents.map((auditEventOrNote, index) => (
            <ReferralTimelineItem
              key={auditEventOrNote.id}
              lastItem={index === combinedEvents.length - 1}
              auditEventOrNote={auditEventOrNote}
            />
          ))}
        </Timeline>
      </Box>
      <Typography
        my={4}
        variant='body2'
        textAlign='center'
        color='text.secondary'
      >
        End of Activity
      </Typography>
    </Stack>
  );
};

export default ReferralTimeline;
