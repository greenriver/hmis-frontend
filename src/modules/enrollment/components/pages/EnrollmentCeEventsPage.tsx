import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useCallback, useMemo } from 'react';

import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { useViewEditRecordDialogs } from '@/modules/form/hooks/useViewEditRecordDialogs';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  eventReferralResult,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DataCollectionFeatureRole,
  DeleteCeEventDocument,
  EventFieldsFragment,
  GetEnrollmentEventsDocument,
  GetEnrollmentEventsQuery,
  GetEnrollmentEventsQueryVariables,
  RecordFormRole,
} from '@/types/gqlTypes';

const EnrollmentCeEventsPage = () => {
  const { enrollment, getEnrollmentFeature } = useEnrollmentDashboardContext();
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
      formRole: RecordFormRole.CeEvent,
      recordName: 'CE Event',
      evictCache,
      deleteRecordDocument: DeleteCeEventDocument,
      deleteRecordIdPath: 'deleteCeEvent.ceEvent.id',
      maxWidth: 'sm',
      localConstants,
      projectId: enrollment?.project.id,
    });

  const ceEventFeature = getEnrollmentFeature(
    DataCollectionFeatureRole.CeEvent
  );

  const columns: ColumnDef<EventFieldsFragment>[] = useMemo(
    () => [
      {
        header: 'Event Type',
        render: (e: EventFieldsFragment) => (
          <HmisEnum value={e.event} enumMap={HmisEnums.EventType} />
        ),
        sticky: 'left',
      },
      {
        header: 'Event Date',
        render: (e: EventFieldsFragment) => parseAndFormatDate(e.eventDate),
      },
      {
        header: 'Referral Result',
        render: (e: EventFieldsFragment) => eventReferralResult(e),
      },
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (e: EventFieldsFragment) => (
          <TableRowActions
            record={e}
            recordName={`${HmisEnums.EventType[e.event]} on ${parseAndFormatDate(e.eventDate)}`}
            menuActionConfigs={[
              {
                title: 'View CE Event',
                key: 'ce event',
                ariaLabel: `View CE Event, ${HmisEnums.EventType[e.event]} on ${parseAndFormatDate(e.eventDate)}`,
                onClick: () => onSelectRecord(e),
              },
            ]}
          />
        ),
      },
    ],
    [onSelectRecord]
  );

  if (!enrollment || !enrollmentId || !clientId || !ceEventFeature)
    return <NotFound />;

  return (
    <>
      <TitleCard
        title='Coordinated Entry Events'
        headerVariant='border'
        headerComponent='h1'
        actions={
          canEditCeEvents &&
          !ceEventFeature.legacy && (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add Coordinated Entry Event
            </Button>
          )
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
          handleRowClick={(row) => onSelectRecord(row)}
          pagePath='enrollment.events'
          noData='No events'
          headerCellSx={() => ({ color: 'text.secondary' })}
        />
      </TitleCard>
      {viewRecordDialog()}
      {editRecordDialog()}
    </>
  );
};

export default EnrollmentCeEventsPage;
