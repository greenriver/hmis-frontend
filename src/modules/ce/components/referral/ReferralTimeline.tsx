import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from '@mui/lab';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { getFormattedDates } from '@/components/elements/RelativeDateDisplay';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referral: Pick<CeReferralFieldsFragment, 'events'>;
}
const ReferralTimeline: React.FC<Props> = ({ referral }: Props) => {
  return (
    <>
      <Box
        sx={{
          width: '100%',
          boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.2)', // Custom bottom shadow
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
          {referral.events.nodes.map((event, index) => {
            const [formattedDate, formattedDateRelative] = getFormattedDates(
              event.createdAt
            );

            return (
              <TimelineItem key={event.id}>
                <TimelineSeparator>
                  <TimelineDot />
                  {index < referral.events.nodes.length - 1 && (
                    <TimelineConnector />
                  )}
                </TimelineSeparator>

                <TimelineContent sx={{ m: 'auto' }}>
                  <Typography variant='caption'>{event.user?.name}</Typography>

                  <Typography variant='body2' fontWeight='bold'>
                    {event.type}
                  </Typography>

                  <Typography variant='body2'>{event.stepName}</Typography>

                  <Typography variant='caption' color='text.primary'>
                    {formattedDateRelative}{' '}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    ({formattedDate})
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </Box>
      <Typography
        my={4}
        variant='caption'
        textAlign='center'
        color='text.secondary'
      >
        End of Activity
      </Typography>
    </>
  );
};

export default ReferralTimeline;
