import { Stack, Typography } from '@mui/material';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  parseAndFormatDate,
  eventReferralResult,
} from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  EventFieldsFragment,
  GetEnrollmentEventsDocument,
  GetEnrollmentEventsQuery,
  GetEnrollmentEventsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<EventFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Type',
    render: (e) => HmisEnums.EventType[e.event],
  },
  {
    header: 'Date',
    render: (e) => parseAndFormatDate(e.eventDate),
  },
  {
    header: 'Result',
    render: (e) => eventReferralResult(e),
  },
];

const EventsPanel = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
}) => (
  <Stack>
    <Stack sx={{ mb: 2, alignItems: 'center' }} direction='row' gap={3}>
      <Typography variant='h5'>Events</Typography>
      <ButtonLink variant='outlined' color='secondary' size='small' to=''>
        + Add Event
      </ButtonLink>
    </Stack>
    <GenericTableWithData<
      GetEnrollmentEventsQuery,
      GetEnrollmentEventsQueryVariables,
      EventFieldsFragment
    >
      queryVariables={{ id: enrollmentId }}
      queryDocument={GetEnrollmentEventsDocument}
      columns={columns}
      pagePath='enrollment.events'
      noData='No events.'
    />
  </Stack>
);

export default EventsPanel;
