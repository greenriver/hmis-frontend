import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

import { useState } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import useViewDialog from '@/modules/form/hooks/useViewDialog';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CurrentLivingSituationFieldsFragment,
  FormRole,
  GetEnrollmentCurrentLivingSituationsDocument,
  GetEnrollmentCurrentLivingSituationsQuery,
  GetEnrollmentCurrentLivingSituationsQueryVariables,
} from '@/types/gqlTypes';

const baseColumns: ColumnDef<CurrentLivingSituationFieldsFragment>[] = [
  {
    header: 'Information Date',
    render: (e) => parseAndFormatDate(e.informationDate),
  },
  {
    header: 'Living Situation',
    render: (e) => (
      <HmisEnum
        value={e.currentLivingSituation}
        enumMap={HmisEnums.CurrentLivingSituationOptions}
      />
    ),
  },
  {
    header: 'Location Details',
    width: '40%',
    render: (e) => e.locationDetails,
  },
];

const EnrollmentCurrentLivingSituationsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const [viewingRecord, setViewingRecord] = useState<
    CurrentLivingSituationFieldsFragment | undefined
  >();

  const { openViewDialog, renderViewDialog, closeViewDialog } =
    useViewDialog<CurrentLivingSituationFieldsFragment>({
      record: viewingRecord,
      onClose: () => setViewingRecord(undefined),
      formRole: FormRole.CurrentLivingSituation,
    });

  const { openFormDialog, renderFormDialog } =
    useFormDialog<CurrentLivingSituationFieldsFragment>({
      formRole: FormRole.CurrentLivingSituation,
      onCompleted: () => {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'currentLivingSituations',
        });
        closeViewDialog();
      },
      inputVariables: { enrollmentId },
      record: viewingRecord,
    });

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;
  const canEditCls = enrollment.access.canEditEnrollments;

  return (
    <>
      <TitleCard
        title='Current Living Situations'
        headerVariant='border'
        actions={
          canEditCls ? (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add Current Living Situation
            </Button>
          ) : null
        }
      >
        <GenericTableWithData<
          GetEnrollmentCurrentLivingSituationsQuery,
          GetEnrollmentCurrentLivingSituationsQueryVariables,
          CurrentLivingSituationFieldsFragment
        >
          queryVariables={{ id: enrollmentId }}
          queryDocument={GetEnrollmentCurrentLivingSituationsDocument}
          columns={baseColumns}
          pagePath='enrollment.currentLivingSituations'
          noData='No current living situations'
          recordType='CurrentLivingSituation'
          headerCellSx={() => ({ color: 'text.secondary' })}
          handleRowClick={(record) => {
            setViewingRecord(record);
            openViewDialog();
          }}
        />
      </TitleCard>
      {renderViewDialog({
        title: 'View Current Living Situation',
        maxWidth: 'md',
        actions: (
          <>
            {viewingRecord && canEditCls && (
              <>
                <Button variant='outlined' onClick={openFormDialog}>
                  Edit
                </Button>
              </>
            )}
          </>
        ),
      })}
      {renderFormDialog({
        title: `${viewingRecord ? 'Update' : 'Add'} Current Living Situation`,
        //md to accomodate radio buttons
        DialogProps: { maxWidth: 'md' },
      })}
    </>
  );
};

export default EnrollmentCurrentLivingSituationsPage;
