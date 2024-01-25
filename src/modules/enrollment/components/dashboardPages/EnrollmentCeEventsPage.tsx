import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useViewEditRecordDialogs } from '@/modules/form/hooks/useViewEditRecordDialogs';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  eventReferralResult,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DeleteCeEventDocument,
  EventFieldsFragment,
  FormRole,
  GetEnrollmentEventsDocument,
  GetEnrollmentEventsQuery,
  GetEnrollmentEventsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<EventFieldsFragment>[] = [
  {
    header: 'Event Date',
    render: (e) => parseAndFormatDate(e.eventDate),
    linkTreatment: true,
  },
  {
    header: 'Event Type',
    render: (e) => <HmisEnum value={e.event} enumMap={HmisEnums.EventType} />,
  },
  {
    header: 'Result',
    render: (e) => eventReferralResult(e),
  },
];

const EnrollmentCeEventsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const evictCache = useCallback(() => {
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'events',
    });
  }, [enrollmentId]);

  const localConstants = useMemo(
    () => ({
      entryDate: enrollment?.entryDate,
      exitDate: enrollment?.exitDate,
    }),
    [enrollment]
  );

  const canEditCeEvents = enrollment?.access?.canEditEnrollments || false;

  const { onSelectRecord, viewRecordDialog, editRecordDialog, openFormDialog } =
    useViewEditRecordDialogs({
      variant: canEditCeEvents ? 'view_and_edit' : 'view_only',
      inputVariables: { enrollmentId },
      formRole: FormRole.CeEvent,
      recordName: 'CE Event',
      evictCache,
      deleteRecordDocument: DeleteCeEventDocument,
      deleteRecordIdPath: 'deleteCeEvent.ceEvent.id',
      maxWidth: 'sm',
      localConstants,
    });

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <>
      <TitleCard
        title='Coordinated Entry Events'
        headerVariant='border'
        actions={
          canEditCeEvents ? (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add Coordinated Entry Event
            </Button>
          ) : null
        }
      >
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
          handleRowClick={onSelectRecord}
        />
      </TitleCard>
      {viewRecordDialog()}
      {editRecordDialog()}
    </>
  );
};

export default EnrollmentCeEventsPage;
