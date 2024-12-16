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
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeAssessmentFieldsFragment,
  DataCollectionFeatureRole,
  DeleteCeAssessmentDocument,
  GetEnrollmentCeAssessmentsDocument,
  GetEnrollmentCeAssessmentsQuery,
  GetEnrollmentCeAssessmentsQueryVariables,
  RecordFormRole,
} from '@/types/gqlTypes';

const COLUMNS: ColumnDef<CeAssessmentFieldsFragment>[] = [
  {
    header: 'Assessment Date',
    render: (a) => parseAndFormatDate(a.assessmentDate),
  },
  {
    header: 'Assessment Level',
    render: (a) => (
      <HmisEnum value={a.assessmentLevel} enumMap={HmisEnums.AssessmentLevel} />
    ),
  },
  {
    header: 'Assessment Type',
    render: (a) => (
      <HmisEnum value={a.assessmentType} enumMap={HmisEnums.AssessmentType} />
    ),
  },
  {
    header: 'Assessment Location',
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
];

const EnrollmentCeAssessmentsPage = () => {
  const { enrollment, getEnrollmentFeature } = useEnrollmentDashboardContext();
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

  const ceAssessmentFeature = getEnrollmentFeature(
    DataCollectionFeatureRole.CeAssessment
  );

  const getTableRowActions = useCallback(
    (record: CeAssessmentFieldsFragment) => {
      return canEditCeAssessments
        ? {
            primaryAction: {
              title: 'View CE Assessment',
              key: 'ce assessment',
              onClick: () => onSelectRecord(record),
            },
          }
        : {};
    },
    [onSelectRecord, canEditCeAssessments]
  );

  if (!enrollment || !enrollmentId || !clientId || !ceAssessmentFeature)
    return <NotFound />;

  return (
    <>
      <TitleCard
        title='Coordinated Entry Assessments'
        headerVariant='border'
        actions={
          canEditCeAssessments &&
          !ceAssessmentFeature.legacy && (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add Coordinated Entry Assessment
            </Button>
          )
        }
      >
        <GenericTableWithData<
          GetEnrollmentCeAssessmentsQuery,
          GetEnrollmentCeAssessmentsQueryVariables,
          CeAssessmentFieldsFragment
        >
          queryVariables={{ id: enrollmentId }}
          queryDocument={GetEnrollmentCeAssessmentsDocument}
          columns={COLUMNS}
          getTableRowActions={getTableRowActions}
          getRowAccessibleName={(record) =>
            parseAndFormatDate(record.assessmentDate) || 'unknown date'
          }
          pagePath='enrollment.ceAssessments'
          noData='No Coordinated Entry Assessments'
          headerCellSx={() => ({ color: 'text.secondary' })}
        />
      </TitleCard>
      {editRecordDialog()}
      {viewRecordDialog()}
    </>
  );
};

export default EnrollmentCeAssessmentsPage;
