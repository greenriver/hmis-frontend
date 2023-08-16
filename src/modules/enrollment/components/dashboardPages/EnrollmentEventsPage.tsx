import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useState } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  eventReferralResult,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
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

  const { openFormDialog, renderFormDialog } =
    useFormDialog<EventFieldsFragment>({
      formRole: FormRole.CeEvent,
      onCompleted: () => {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'events',
        });
      },
      inputVariables: { enrollmentId },
      record: viewingRecord,
      onClose: () => setViewingRecord(undefined),
    });

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
          handleRowClick={
            canEditCeEvents
              ? (record) => {
                  setViewingRecord(record);
                  openFormDialog();
                }
              : undefined
          }
        />
      </TitleCard>
      {renderFormDialog({
        title: viewingRecord
          ? 'Edit Coordinated Entry Event'
          : 'Add Coordinated Entry Event',
        //md to accomodate radio buttons
        DialogProps: { maxWidth: 'md' },
        // otherActions: (
        //   <>
        //     {viewingRecord && (
        //       <DeleteMutationButton<
        //         DeleteCeAssessmentMutation,
        //         DeleteCeAssessmentMutationVariables
        //       >
        //         queryDocument={DeleteCeAssessmentDocument}
        //         variables={{ id: viewingRecord.id }}
        //         idPath={'deleteCeAssessment.ceAssessment.id'}
        //         recordName='CE Assessment'
        //         onSuccess={onSuccessfulDelete}
        //       >
        //         Delete
        //       </DeleteMutationButton>
        //     )}
        //   </>
        // ),
      })}
    </>
  );
};

export default EnrollmentEventsPage;
