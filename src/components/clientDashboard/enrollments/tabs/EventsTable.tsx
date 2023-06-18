import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  eventReferralResult,
  parseAndFormatDate,
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
    render: (e) => <HmisEnum value={e.event} enumMap={HmisEnums.EventType} />,
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

const EventsTable = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
}) => (
  <GenericTableWithData<
    GetEnrollmentEventsQuery,
    GetEnrollmentEventsQueryVariables,
    EventFieldsFragment
  >
    queryVariables={{ id: enrollmentId }}
    queryDocument={GetEnrollmentEventsDocument}
    columns={columns}
    pagePath='enrollment.events'
    noData='No events'
    headerCellSx={() => ({ color: 'text.secondary' })}
  />
);

export default EventsTable;
