import { Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import GenericTable, { Columns } from '../../../elements/GenericTable';

import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  useGetClientEnrollmentsQuery,
} from '@/types/gqlTypes';

const DEFAULT_ROWS_PER_PAGE = 10;

const COLUMNS: Columns<EnrollmentFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Project',
    render: (e: EnrollmentFieldsFragment) => e.project.projectName,
  },
  {
    header: 'Start Date',
    render: (e: EnrollmentFieldsFragment) =>
      e.entryDate ? HmisUtil.parseAndFormatDate(e.entryDate) : 'Unknown',
  },
  {
    header: 'End Date',
    render: (e: EnrollmentFieldsFragment) =>
      e.exitDate ? HmisUtil.parseAndFormatDate(e.exitDate) : 'Active',
  },
];
interface Props {
  clientId: string;
}

const EnrollmentsTable = ({ clientId }: Props) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const navigate = useNavigate();

  const {
    data: { client: client } = {},
    loading,
    error,
  } = useGetClientEnrollmentsQuery({
    variables: {
      id: clientId,
      offset: page * rowsPerPage,
      limit: rowsPerPage,
    },
    notifyOnNetworkStatusChange: true,
  });
  if (error) throw error;
  if (!loading && !client) throw Error('Client not found');

  const handleRowClick = useMemo(() => {
    if (!client) return undefined;
    return (enrollment: EnrollmentFieldsFragment) =>
      navigate(
        generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
          clientId: client.id,
          enrollmentId: enrollment.id,
        })
      );
  }, [client, navigate]);

  const tablePaginationProps = useMemo(() => {
    if (!client) return undefined;
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
      count: client.enrollments.nodesCount,
    };
  }, [client, page, rowsPerPage]);

  if (client?.enrollments?.nodesCount === 0) {
    return <Typography>No enrollments</Typography>;
  }

  return (
    <GenericTable<EnrollmentFieldsFragment>
      loading={loading}
      rows={client?.enrollments?.nodes || []}
      handleRowClick={handleRowClick}
      columns={COLUMNS}
      paginated
      tablePaginationProps={tablePaginationProps}
    />
  );
};

export default EnrollmentsTable;
