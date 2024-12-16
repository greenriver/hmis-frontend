import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useCallback, useMemo } from 'react';
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
    width: '180px',
    render: (e: CurrentLivingSituationFieldsFragment) =>
      parseAndFormatDate(e.informationDate),
  },
  livingSituation: {
    header: 'Living Situation',
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
    (rows: CurrentLivingSituationFieldsFragment[]) => {
      const customColumns = getCustomDataElementColumns(rows);
      return [
        CLS_COLUMNS.informationDate,
        CLS_COLUMNS.livingSituation,
        CLS_COLUMNS.locationDetails,
        ...customColumns,
      ];
    },
    []
  );

  const getTableRowActions = useCallback(
    (record: CurrentLivingSituationFieldsFragment) => {
      return {
        primaryAction: {
          title: 'View CLS',
          key: 'cls',
          ariaLabel: `View Current Living Situation, ${parseAndFormatDate(record.informationDate) || 'unknown date'}`,
          onClick: () => onSelectRecord(record),
        },
      };
    },
    [onSelectRecord]
  );

  if (!enrollment || !enrollmentId || !clientId || !clsFeature)
    return <NotFound />;

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
          getTableRowActions={getTableRowActions}
          getRowAccessibleName={(record) =>
            parseAndFormatDate(record.informationDate) || 'unknown date'
          }
          pagePath='enrollment.currentLivingSituations'
          noData='No current living situations'
          recordType='CurrentLivingSituation'
          headerCellSx={() => ({ color: 'text.secondary' })}
        />
      </TitleCard>
      {viewRecordDialog()}
      {editRecordDialog()}
    </>
  );
};

export default EnrollmentCurrentLivingSituationsPage;
