import { Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import GenericTable, { Columns } from '@/components/elements/GenericTable';
import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  useGetEnrollmentAssessmentsQuery,
} from '@/types/gqlTypes';

const DEFAULT_ROWS_PER_PAGE = 10;

const COLUMNS: Columns<AssessmentFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Type',
    render: (e: AssessmentFieldsFragment) => e.assessmentType,
  },
  {
    header: 'Date',
    render: (e: AssessmentFieldsFragment) =>
      e.assessmentDate
        ? HmisUtil.parseAndFormatDate(e.assessmentDate)
        : 'Unknown',
  },
];
interface Props {
  clientId: string;
  enrollmentId: string;
}

const AssessmentsTable = ({ clientId, enrollmentId }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const navigate = useNavigate();

  const {
    data: { enrollment } = {},
    loading,
    error,
  } = useGetEnrollmentAssessmentsQuery({
    variables: {
      id: enrollmentId,
      offset: page * rowsPerPage,
      limit: rowsPerPage,
    },
    notifyOnNetworkStatusChange: true,
  });
  if (error) throw error;
  if (!loading && !enrollment) throw Error('Client not found');

  const handleRowClick = useMemo(() => {
    if (!enrollment) return undefined;
    return (assessment: AssessmentFieldsFragment) =>
      navigate(
        generatePath(DashboardRoutes.VIEW_ASSESSMENT, {
          clientId,
          enrollmentId,
          assessmentId: assessment.id,
        })
      );
  }, [clientId, enrollmentId, enrollment, navigate]);

  const tablePaginationProps = useMemo(() => {
    if (!enrollment) return undefined;
    return {
      rowsPerPage,
      page,
      onPageChange: (_: any, newPage: number) => setPage(newPage),
      onRowsPerPageChange: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      ) => {
        const newRowsPerPage = parseInt(
          event.target.value,
          DEFAULT_ROWS_PER_PAGE
        );
        setRowsPerPage(newRowsPerPage);
        setPage(0);
      },
      count: enrollment.assessments.nodesCount,
    };
  }, [enrollment, page, rowsPerPage]);

  if (enrollment?.assessments?.nodesCount === 0) {
    return <Typography>No assessments</Typography>;
  }

  return (
    <GenericTable<AssessmentFieldsFragment>
      loading={loading}
      rows={enrollment?.assessments?.nodes || []}
      handleRowClick={handleRowClick}
      columns={COLUMNS}
      paginated
      tablePaginationProps={tablePaginationProps}
    />
  );
};

export default AssessmentsTable;
