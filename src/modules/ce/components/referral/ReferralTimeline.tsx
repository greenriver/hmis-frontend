import { Timeline, timelineItemClasses } from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import ReferralTimelineItem from '@/modules/ce/components/referral/ReferralTimelineItem';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referral: Pick<CeReferralFieldsFragment, 'auditEvents'>;
}

const ReferralTimeline: React.FC<Props> = ({ referral }: Props) => {
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
        <Timeline
          sx={{
            // https://mui.com/material-ui/react-timeline/#left-aligned-with-no-opposite-content
            [`& .${timelineItemClasses.root}:before`]: {
              flex: 0,
              padding: 0,
            },
          }}
        >
          {referral.auditEvents.nodes.map((auditEvent, index) => (
            <ReferralTimelineItem
              key={auditEvent.id}
              lastItem={index === referral.auditEvents.nodes.length - 1}
              auditEvent={auditEvent}
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
