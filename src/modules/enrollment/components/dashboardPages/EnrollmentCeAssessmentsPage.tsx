import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
import { useCallback, useMemo } from 'react';

import { cache } from '@/app/apolloClient';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useViewEditRecordDialogs } from '@/modules/form/hooks/useViewEditRecordDialogs';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeAssessmentFieldsFragment,
  DeleteCeAssessmentDocument,
  RecordFormRole,
  GetEnrollmentCeAssessmentsDocument,
  GetEnrollmentCeAssessmentsQuery,
  GetEnrollmentCeAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const EnrollmentCeAssessmentsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const canEditCeAssessments = enrollment?.access?.canEditEnrollments || false;

  const evictCache = useCallback(() => {
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'ceAssessments',
    });
  }, [enrollmentId]);

  const localConstants = useMemo(
    () => ({
      projectName: enrollment?.project.projectName,
      entryDate: enrollment?.entryDate,
      exitDate: enrollment?.exitDate,
    }),
    [enrollment]
  );

  const { onSelectRecord, editRecordDialog, openFormDialog, viewRecordDialog } =
    useViewEditRecordDialogs({
      variant: canEditCeAssessments ? 'edit_only' : 'view_only',
      inputVariables: { enrollmentId },
      formRole: RecordFormRole.CeAssessment,
      recordName: 'CE Assessment',
      evictCache,
      deleteRecordDocument: DeleteCeAssessmentDocument,
      deleteRecordIdPath: 'deleteCeAssessment.ceAssessment.id',
      maxWidth: 'sm',
      localConstants,
      projectId: enrollment?.project.id,
    });

  const columns: ColumnDef<CeAssessmentFieldsFragment>[] = useMemo(
    () => [
      {
        header: 'Assessment Date',
        render: (a) => parseAndFormatDate(a.assessmentDate),
        linkTreatment: canEditCeAssessments,
      },
      {
        header: 'Level',
        render: (a) => (
          <HmisEnum
            value={a.assessmentLevel}
            enumMap={HmisEnums.AssessmentLevel}
          />
        ),
      },
      {
        header: 'Type',
        render: (a) => (
          <HmisEnum
            value={a.assessmentType}
            enumMap={HmisEnums.AssessmentType}
          />
        ),
      },
      {
        header: 'Location',
        render: (a) => a.assessmentLocation,
      },
      {
        header: 'Prioritization Status',
        render: (a) => (
          <HmisEnum
            value={a.prioritizationStatus}
            enumMap={HmisEnums.PrioritizationStatus}
          />
        ),
      },
    ],
    [canEditCeAssessments]
  );

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <>
      <TitleCard
        title='Coordinated Entry Assessments'
        headerVariant='border'
        actions={
          canEditCeAssessments ? (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add Coordinated Entry Assessment
            </Button>
          ) : null
        }
      >
        <GenericTableWithData<
          GetEnrollmentCeAssessmentsQuery,
          GetEnrollmentCeAssessmentsQueryVariables,
          CeAssessmentFieldsFragment
        >
          queryVariables={{ id: enrollmentId }}
          queryDocument={GetEnrollmentCeAssessmentsDocument}
          columns={columns}
          pagePath='enrollment.ceAssessments'
          noData='No Coordinated Entry Assessments'
          headerCellSx={() => ({ color: 'text.secondary' })}
          // no need for read-only users to click in, because they can see all the information in the table.
          handleRowClick={canEditCeAssessments ? onSelectRecord : undefined}
        />
      </TitleCard>
      {editRecordDialog()}
      {viewRecordDialog()}
    </>
  );
};

export default EnrollmentCeAssessmentsPage;
