import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useCallback, useState } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import useViewDialog from '@/modules/form/hooks/useViewDialog';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  eventReferralResult,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DeleteCeEventDocument,
  DeleteCeEventMutation,
  DeleteCeEventMutationVariables,
  EventFieldsFragment,
  FormRole,
  GetEnrollmentEventsDocument,
  GetEnrollmentEventsQuery,
  GetEnrollmentEventsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<EventFieldsFragment>[] = [
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

const EnrollmentEventsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const [viewingRecord, setViewingRecord] = useState<
    EventFieldsFragment | undefined
  >();

  const { openViewDialog, renderViewDialog, closeViewDialog } =
    useViewDialog<EventFieldsFragment>({
      record: viewingRecord,
      onClose: () => setViewingRecord(undefined),
      formRole: FormRole.CeEvent,
    });

  const { openFormDialog, renderFormDialog, closeDialog } =
    useFormDialog<EventFieldsFragment>({
      formRole: FormRole.CeEvent,
      onCompleted: () => {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'events',
        });
        setViewingRecord(undefined);
        closeViewDialog();
      },
      inputVariables: { enrollmentId },
      record: viewingRecord,
    });

  const onSuccessfulDelete = useCallback(() => {
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'events',
    });
    closeDialog();
    closeViewDialog();
    setViewingRecord(undefined);
  }, [closeDialog, closeViewDialog, enrollmentId]);

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;
  const canEditCeEvents = enrollment.access.canEditEnrollments;

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
          handleRowClick={(record) => {
            setViewingRecord(record);
            openViewDialog();
          }}
        />
      </TitleCard>
      {renderViewDialog({
        title: 'View Coordinated Entry Event',
        maxWidth: 'md',
        actions: (
          <>
            {viewingRecord && canEditCeEvents && (
              <>
                <Button variant='outlined' onClick={openFormDialog}>
                  Edit
                </Button>
                <DeleteMutationButton<
                  DeleteCeEventMutation,
                  DeleteCeEventMutationVariables
                >
                  queryDocument={DeleteCeEventDocument}
                  variables={{ id: viewingRecord.id }}
                  idPath={'deleteCeEvent.ceEvent.id'}
                  recordName='Coordinated Entry Event'
                  onSuccess={onSuccessfulDelete}
                >
                  Delete
                </DeleteMutationButton>
              </>
            )}
          </>
        ),
      })}
      {renderFormDialog({
        title: viewingRecord
          ? 'Edit Coordinated Entry Event'
          : 'Add Coordinated Entry Event',
        DialogProps: { maxWidth: 'md' },
      })}
    </>
  );
};

export default EnrollmentEventsPage;
