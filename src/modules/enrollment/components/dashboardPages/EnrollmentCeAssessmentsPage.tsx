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
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeAssessmentFieldsFragment,
  FormRole,
  GetEnrollmentCeAssessmentsDocument,
  GetEnrollmentCeAssessmentsQuery,
  GetEnrollmentCeAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<CeAssessmentFieldsFragment>[] = [
  {
    header: 'Date',
    render: (a) => parseAndFormatDate(a.assessmentDate),
  },
  {
    header: 'Level',
    render: (a) => (
      <HmisEnum value={a.assessmentLevel} enumMap={HmisEnums.AssessmentLevel} />
    ),
  },
  {
    header: 'Type',
    render: (a) => (
      <HmisEnum value={a.assessmentType} enumMap={HmisEnums.AssessmentType} />
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
];

const EnrollmentCeAssessmentsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const [viewingRecord, setViewingRecord] = useState<
    CeAssessmentFieldsFragment | undefined
  >();

  const { openFormDialog, renderFormDialog } =
    useFormDialog<CeAssessmentFieldsFragment>({
      formRole: FormRole.CeAssessment,
      onCompleted: () => {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'ceAssessments',
        });
      },
      inputVariables: { enrollmentId },
      record: viewingRecord,
      onClose: () => setViewingRecord(undefined),
    });

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;
  const canEditCeAssessments = enrollment.access.canEditEnrollments;

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
              Add CE Assessment
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
          noData='No CE assessments'
          headerCellSx={() => ({ color: 'text.secondary' })}
          handleRowClick={
            canEditCeAssessments
              ? (record) => {
                  setViewingRecord(record);
                  openFormDialog();
                }
              : undefined
          }
        />
      </TitleCard>
      {renderFormDialog({
        title: 'Add CE Assessment',
        //md to accomodate radio buttons
        DialogProps: { maxWidth: 'md' },
      })}
    </>
  );
};

export default EnrollmentCeAssessmentsPage;
