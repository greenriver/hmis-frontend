import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
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
  DataCollectionFeatureRole,
  DeleteCurrentLivingSituationDocument,
  GetEnrollmentCurrentLivingSituationsDocument,
  GetEnrollmentCurrentLivingSituationsQuery,
  GetEnrollmentCurrentLivingSituationsQueryVariables,
  RecordFormRole,
} from '@/types/gqlTypes';

export const CLS_COLUMNS = {
  informationDate: {
    header: 'Information Date',
    key: 'date',
    width: '180px',
    render: (e: CurrentLivingSituationFieldsFragment) =>
      parseAndFormatDate(e.informationDate),
  },
  livingSituation: {
    header: 'Living Situation',
    key: 'livingSituation',
    width: '400px',
    render: (e: CurrentLivingSituationFieldsFragment) => (
      <HmisEnum
        value={e.currentLivingSituation}
        enumMap={HmisEnums.CurrentLivingSituationOptions}
      />
    ),
  },
  locationDetails: {
    header: 'Location Details',
    key: 'locationDetails',
    render: (e: CurrentLivingSituationFieldsFragment) => e.locationDetails,
  },
};

const EnrollmentCurrentLivingSituationsPage = () => {
  const { enrollment, getEnrollmentFeature } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const clsFeature = getEnrollmentFeature(
    DataCollectionFeatureRole.CurrentLivingSituation
  );

  const evictCache = useCallback(() => {
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'currentLivingSituations',
    });
  }, [enrollmentId]);

  const canEditCls =
    (enrollment?.access?.canEditEnrollments &&
      !!clsFeature &&
      !clsFeature?.legacy) ||
    false;

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
    (
      rows: CurrentLivingSituationFieldsFragment[]
    ): ColumnDef<CurrentLivingSituationFieldsFragment>[] => {
      const customColumns = getCustomDataElementColumns(rows);
      return [
        { ...CLS_COLUMNS.informationDate, sticky: 'left' },
        CLS_COLUMNS.livingSituation,
        CLS_COLUMNS.locationDetails,
        ...customColumns,
      ];
    },
    []
  );

  if (!enrollment || !enrollmentId || !clientId || !clsFeature)
    return <NotFound />;

  return (
    <>
      <TitleCard
        title='Current Living Situations'
        headerVariant='border'
        headerComponent='h1'
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
          rowActionTitle='View Current Living Situation'
          rowName={(row) =>
            parseAndFormatDate(row.informationDate) || 'unknown date'
          }
          handleRowClick={onSelectRecord}
          pagePath='enrollment.currentLivingSituations'
          noData='No current living situations'
          recordType='CurrentLivingSituation'
        />
      </TitleCard>
      {viewRecordDialog()}
      {editRecordDialog()}
    </>
  );
};

export default EnrollmentCurrentLivingSituationsPage;
