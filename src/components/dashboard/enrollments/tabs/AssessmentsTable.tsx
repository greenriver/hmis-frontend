import { Button, Stack, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';

import AssessmentStatus from '@/components/elements/AssessmentStatus';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentFieldsFragment,
  EnrollmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
  ProjectType,
  useDeleteAssessmentMutation,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ceColumns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'CE Type',
    render: (a) => (
      <HmisEnum value={a.assessmentType} enumMap={HmisEnums.AssessmentType} />
    ),
    linkTreatment: true,
  },
  {
    header: 'Level',
    render: (a) => (
      <HmisEnum value={a.assessmentLevel} enumMap={HmisEnums.AssessmentLevel} />
    ),
  },
  {
    header: 'Location',
    render: (e) => e.assessmentLocation,
  },
];

const columns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'Date',
    width: '10%',
    linkTreatment: true,
    render: (e) => parseAndFormatDate(e.assessmentDate),
  },
  {
    header: 'Type',
    width: '10%',
    render: (assessment) =>
      startCase(assessment.assessmentDetail?.role?.toLowerCase()),
  },
  {
    header: 'Status',
    width: '10%',
    render: (assessment) => <AssessmentStatus assessment={assessment} />,
  },

  {
    header: 'Last Updated',
    width: '25%',
    render: (e) =>
      `${parseAndFormatDateTime(e.dateUpdated)} by ${
        e.user?.name || 'Unknown User'
      }`,
  },
];

const AssessmentsTable = ({
  clientId,
  enrollmentId,
  enrollment,
}: {
  clientId: string;
  enrollmentId: string;
  enrollment: EnrollmentFieldsFragment;
}) => {
  const [recordToDelete, setRecordToDelete] =
    useState<AssessmentFieldsFragment | null>(null);
  const rowLinkTo = useCallback(
    (assessment: AssessmentFieldsFragment) =>
      generateSafePath(DashboardRoutes.VIEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: assessment.id,
      }),
    [clientId, enrollmentId]
  );

  const [deleteRecord, { loading: deleteLoading, error: deleteError }] =
    useDeleteAssessmentMutation({
      onCompleted: (res) => {
        const id = res.deleteAssessment?.assessment?.id;
        if (id) {
          setRecordToDelete(null);
          // Force re-fetch table
          cache.evict({
            id: `Assessment:${id}`,
          });
        }
      },
    });
  const handleDelete = useCallback(() => {
    if (!recordToDelete) return;
    deleteRecord({ variables: { id: recordToDelete.id } });
  }, [recordToDelete, deleteRecord]);
  if (deleteError) console.error(deleteError);

  const tableColumns = useMemo(
    () => [
      ...(enrollment.project.projectType === ProjectType.Ce
        ? [...columns, ...ceColumns]
        : columns),
      {
        header: '',
        width: '1%',
        render: (record) => (
          <Stack
            direction='row'
            spacing={1}
            justifyContent='flex-end'
            flexGrow={1}
          >
            <Button
              data-testid='deleteService'
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setRecordToDelete(record);
              }}
              size='small'
              variant='outlined'
              color='error'
            >
              Delete
            </Button>
          </Stack>
        ),
      },
    ],
    [enrollment]
  );

  return (
    <>
      <GenericTableWithData<
        GetEnrollmentAssessmentsQuery,
        GetEnrollmentAssessmentsQueryVariables,
        AssessmentFieldsFragment
      >
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentAssessmentsDocument}
        rowLinkTo={rowLinkTo}
        columns={tableColumns}
        pagePath='enrollment.assessments'
        noData='No assessments.'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />
      <ConfirmationDialog
        id='deleteAssessment'
        open={!!recordToDelete}
        title='Delete Assessment'
        onConfirm={handleDelete}
        onCancel={() => setRecordToDelete(null)}
        loading={deleteLoading}
      >
        {recordToDelete && (
          <>
            <Typography>
              Are you sure you want to delete this assessment?
            </Typography>
            <Typography>This action cannot be undone.</Typography>
          </>
        )}
      </ConfirmationDialog>
    </>
  );
};

export default AssessmentsTable;
