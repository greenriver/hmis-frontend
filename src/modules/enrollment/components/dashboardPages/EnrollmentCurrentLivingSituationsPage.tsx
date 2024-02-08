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
  getCustomDataElementColumns,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CurrentLivingSituationFieldsFragment,
  DeleteCurrentLivingSituationDocument,
  GetEnrollmentCurrentLivingSituationsDocument,
  GetEnrollmentCurrentLivingSituationsQuery,
  GetEnrollmentCurrentLivingSituationsQueryVariables,
  RecordFormRole,
} from '@/types/gqlTypes';

const baseColumns: ColumnDef<CurrentLivingSituationFieldsFragment>[] = [
  {
    header: 'Information Date',
    width: '180px',
    render: (e) => parseAndFormatDate(e.informationDate),
    linkTreatment: true,
  },
  {
    header: 'Living Situation',
    width: '400px',
    render: (e) => (
      <HmisEnum
        value={e.currentLivingSituation}
        enumMap={HmisEnums.CurrentLivingSituationOptions}
      />
    ),
  },
  {
    header: 'Location Details',
    render: (e) => e.locationDetails,
  },
];

const EnrollmentCurrentLivingSituationsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const evictCache = useCallback(() => {
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'currentLivingSituations',
    });
  }, [enrollmentId]);

  const canEditCls = enrollment?.access?.canEditEnrollments || false;

  const localConstants = useMemo(
    () => ({
      entryDate: enrollment?.entryDate,
      exitDate: enrollment?.exitDate,
    }),
    [enrollment]
  );

  const { onSelectRecord, viewRecordDialog, editRecordDialog, openFormDialog } =
    useViewEditRecordDialogs({
      variant: canEditCls ? 'view_and_edit' : 'view_only',
      inputVariables: { enrollmentId },
      formRole: RecordFormRole.CurrentLivingSituation,
      recordName: 'Current Living Situation',
      evictCache,
      deleteRecordDocument: DeleteCurrentLivingSituationDocument,
      deleteRecordIdPath:
        'deleteCurrentLivingSituation.currentLivingSituation.id',
      localConstants,
      projectId: enrollment?.project.id,
    });

  const getColumnDefs = useCallback(
    (rows: CurrentLivingSituationFieldsFragment[]) => {
      const customColumns = getCustomDataElementColumns(rows);
      return [...baseColumns, ...customColumns];
    },
    []
  );

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

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
          getColumnDefs={getColumnDefs}
          pagePath='enrollment.currentLivingSituations'
          noData='No current living situations'
          recordType='CurrentLivingSituation'
          headerCellSx={() => ({ color: 'text.secondary' })}
          handleRowClick={onSelectRecord}
        />
      </TitleCard>
      {viewRecordDialog()}
      {editRecordDialog()}
    </>
  );
};

export default EnrollmentCurrentLivingSituationsPage;
