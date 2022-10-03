import { Stack, Typography } from '@mui/material';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import {
  eventReferralResult,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
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
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
}) => (
  <Stack>
    <Stack sx={{ mb: 2, alignItems: 'center' }} direction='row' gap={3}>
      <Typography variant='h5'>Events</Typography>
      <ButtonLink
        variant='outlined'
        color='secondary'
        size='small'
        to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
          clientId,
          enrollmentId,
          assessmentType: 'TODO',
        })}
      >
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
      toNodes={(data: GetEnrollmentEventsQuery) =>
        data.enrollment?.events?.nodes || []
      }
      toNodesCount={(data: GetEnrollmentEventsQuery) =>
        data.enrollment?.events?.nodesCount
      }
      noData='No events.'
    />
  </Stack>
);

export default EventsPanel;
