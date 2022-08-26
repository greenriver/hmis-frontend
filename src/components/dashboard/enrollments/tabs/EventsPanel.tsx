import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink, generatePath } from 'react-router-dom';

import { Columns } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EventFieldsFragment,
  GetEnrollmentEventsDocument,
  GetEnrollmentEventsQuery,
  GetEnrollmentEventsQueryVariables,
} from '@/types/gqlTypes';

const columns: Columns<EventFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Type',
    render: 'event',
  },
  {
    header: 'Date',
    render: (e) => parseAndFormatDate(e.eventDate),
  },
];

const EventsPanel = ({
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
}) => {
  // FIXME: add back when query works
  return <>WIP</>;

  return (
    <Stack>
      <Stack sx={{ mb: 2, alignItems: 'center' }} direction='row' gap={3}>
        <Typography variant='h5'>Events</Typography>
        <Button
          variant='outlined'
          color='secondary'
          component={RouterLink}
          size='small'
          to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
            clientId,
            enrollmentId,
            assessmentType: 'TODO',
          })}
        >
          + Add Event
        </Button>
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
      />
    </Stack>
  );
};

export default EventsPanel;
