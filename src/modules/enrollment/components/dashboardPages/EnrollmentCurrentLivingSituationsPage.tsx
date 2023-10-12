import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
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
  customDataElementValueAsString,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CurrentLivingSituationFieldsFragment,
  DeleteCurrentLivingSituationDocument,
  DeleteCurrentLivingSituationMutation,
  DeleteCurrentLivingSituationMutationVariables,
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

  const [viewingRecord, setViewingRecord] = useState<
    CurrentLivingSituationFieldsFragment | undefined
  >();

  const { openViewDialog, renderViewDialog, closeViewDialog } =
    useViewDialog<CurrentLivingSituationFieldsFragment>({
      record: viewingRecord,
      onClose: () => setViewingRecord(undefined),
      formRole: FormRole.CurrentLivingSituation,
    });

  const localConstants = useMemo(
    () => ({
      entryDate: enrollment?.entryDate,
      exitDate: enrollment?.exitDate,
    }),
    [enrollment]
  );

  const { openFormDialog, renderFormDialog, closeDialog } =
    useFormDialog<CurrentLivingSituationFieldsFragment>({
      formRole: FormRole.CurrentLivingSituation,
      onCompleted: () => {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'currentLivingSituations',
        });
        setViewingRecord(undefined);
        closeViewDialog();
      },
      inputVariables: { enrollmentId },
      record: viewingRecord,
      localConstants,
    });

  const onSuccessfulDelete = useCallback(() => {
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'currentLivingSituations',
    });
    closeDialog();
    closeViewDialog();
    setViewingRecord(undefined);
  }, [closeDialog, closeViewDialog, enrollmentId]);

  const getColumnDefs = useCallback(
    (rows: CurrentLivingSituationFieldsFragment[]) => {
      // if the CLS has custom data elements, add them as columns in the table
      if (rows.length > 0 && rows[0].customDataElements.length > 0) {
        const cdes = rows[0].customDataElements.map((cde) => ({
          header: cde.label,
          key: cde.key,
          render: (row: CurrentLivingSituationFieldsFragment) => {
            const thisCde = row.customDataElements.find(
              (elem) => elem.key == cde.key
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
          getColumnDefs={getColumnDefs}
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
                <DeleteMutationButton<
                  DeleteCurrentLivingSituationMutation,
                  DeleteCurrentLivingSituationMutationVariables
                >
                  queryDocument={DeleteCurrentLivingSituationDocument}
                  variables={{ id: viewingRecord.id }}
                  idPath={
                    'deleteCurrentLivingSituation.currentLivingSituation.id'
                  }
                  recordName='Current Living Situation'
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
        title: `${viewingRecord ? 'Update' : 'Add'} Current Living Situation`,
        //md to accomodate radio buttons
        DialogProps: { maxWidth: 'md' },
      })}
    </>
  );
};

export default EnrollmentCurrentLivingSituationsPage;
