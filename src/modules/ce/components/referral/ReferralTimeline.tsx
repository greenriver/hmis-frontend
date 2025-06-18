import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import { getFormattedDates } from '@/components/elements/RelativeDateDisplay';
import { HmisEnums } from '@/types/gqlEnums';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referral: Pick<CeReferralFieldsFragment, 'auditEvents'>;
}
const ReferralTimeline: React.FC<Props> = ({ referral }: Props) => {
  return (
    <>
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
            {referral.auditEvents.nodes.map((event, index) => {
              const [formattedDate, formattedDateRelative] = getFormattedDates(
                event.createdAt
              );

              return (
                <TimelineItem key={event.id}>
                  <TimelineSeparator>
                    <TimelineDot />
                    {index < referral.auditEvents.nodes.length - 1 && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>

                  <TimelineContent>
                    <Typography variant='caption'>
                      {event.user?.name}
                    </Typography>

                    <Typography variant='body2' fontWeight='bold'>
                      {HmisEnums.CeReferralAuditEventType[event.type]}
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
      </Stack>
    </>
  );
};

export default ReferralTimeline;
