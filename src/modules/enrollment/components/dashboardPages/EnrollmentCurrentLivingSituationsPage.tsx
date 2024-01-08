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
  customDataElementValueAsString,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CurrentLivingSituationFieldsFragment,
  DeleteCurrentLivingSituationDocument,
  FormRole,
  GetEnrollmentCurrentLivingSituationsDocument,
  GetEnrollmentCurrentLivingSituationsQuery,
  GetEnrollmentCurrentLivingSituationsQueryVariables,
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
      formRole: FormRole.CurrentLivingSituation,
      recordName: 'Current Living Situation',
      evictCache,
      deleteRecordDocument: DeleteCurrentLivingSituationDocument,
      deleteRecordIdPath:
        'deleteCurrentLivingSituation.currentLivingSituation.id',
      localConstants,
    });

  const getColumnDefs = useCallback(
    (rows: CurrentLivingSituationFieldsFragment[]) => {
      // if the CLS has custom data elements, add them as columns in the table
      if (rows.length > 0 && rows[0].customDataElements.length > 0) {
        const cdes = rows[0].customDataElements.map((cde) => ({
          header: cde.label,
          key: cde.key,
          render: (row: CurrentLivingSituationFieldsFragment) => {
            const thisCde = row.customDataElements.find(
              (elem) => elem.key === cde.key
            );
            if (!thisCde) return null;
            return customDataElementValueAsString(thisCde);
          },
        }));
        return [...baseColumns, ...cdes];
      }
      return baseColumns;
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
