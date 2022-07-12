import { useQuery } from '@apollo/client';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
  TableFooter,
  TablePagination,
} from '@mui/material';
import { useState } from 'react';

import { GET_CLIENTS } from '@/api/clients.gql';
import Loading from '@/components/elements/Loading';

// FIXME code-gen
type Client = {
  id: string;
  ssn?: string;
  firstName?: string;
  preferredName?: string;
  lastName?: string;
  dob?: string;
};

interface Props {
  variables: Record<string, any>; // FIXME code-gen
}

const SearchResults: React.FC<Props> = ({ variables }) => {
  const { data, loading, error } = useQuery<{ clients: Client[] }>(
    GET_CLIENTS,
    { variables }
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  if (loading) return <Loading />;
  if (error) return <Paper sx={{ p: 2 }}>{error.message}</Paper>;

  const rows = data?.clients || [];

  // Avoid a layout jump when reaching the last page with empty rows.
  // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Social</TableCell>
            <TableCell>First Name</TableCell>
            <TableCell>Preferred Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>DOB</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component='th' scope='row'>
                {row.id}
              </TableCell>
              <TableCell>{row.ssn}</TableCell>
              <TableCell>{row.firstName}</TableCell>
              <TableCell>{row.preferredName}</TableCell>
              <TableCell>{row.lastName}</TableCell>
              <TableCell>{row.dob}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: {
                  'aria-label': 'rows per page',
                },
                native: true,
              }}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              // ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
export default SearchResults;
