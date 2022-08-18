import { Typography } from '@mui/material';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import GenericTable from './GenericTable';

import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  useGetClientWithEnrollmentsQuery,
} from '@/types/gqlTypes';

interface Props {
  clientId: string;
}

const DEFAULT_ROWS_PER_PAGE = 10;

const EnrollmentsTable = ({ clientId }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const navigate = useNavigate();

  const {
    data: { client: client } = {},
    loading,
    error,
  } = useGetClientWithEnrollmentsQuery({
    variables: {
      id: clientId,
      enrollmentsOffset: page * rowsPerPage,
      enrollmentsLimit: rowsPerPage,
    },
    notifyOnNetworkStatusChange: true,
  });
  if (error) throw error;
  if (!loading && !client) throw Error('Client not found');

  if (client?.enrollments?.nodesCount === 0) {
    return <Typography>No enrollments</Typography>;
  }
  return (
    <GenericTable<EnrollmentFieldsFragment>
      loading={loading}
      rows={client?.enrollments?.nodes || []}
      handleRowClick={
        client
          ? (enrollment) =>
              navigate(
                generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
                  clientId: client.id,
                  enrollmentId: enrollment.id,
                })
              )
          : undefined
      }
      columns={[
        { header: 'ID', render: 'id' },
        { header: 'Project', render: (e) => e.project.projectName },
        {
          header: 'Start Date',
          render: (e) =>
            e.entryDate ? HmisUtil.parseAndFormatDate(e.entryDate) : 'Unknown',
        },
        {
          header: 'End Date',
          render: (e) =>
            e.exitDate ? HmisUtil.parseAndFormatDate(e.exitDate) : 'Active',
        },
      ]}
      paginated
      tablePaginationProps={
        client
          ? {
              rowsPerPage: rowsPerPage,
              page,
              onPageChange: (_, newPage) => setPage(newPage),
              onRowsPerPageChange: (event) => {
                const newRowsPerPage = parseInt(
                  event.target.value,
                  DEFAULT_ROWS_PER_PAGE
                );
                setRowsPerPage(newRowsPerPage);
                setPage(0);
              },
              count: client.enrollments.nodesCount,
            }
          : undefined
      }
    />
  );
};

export default EnrollmentsTable;
