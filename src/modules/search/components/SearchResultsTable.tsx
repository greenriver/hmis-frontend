import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Stack,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import * as HmisUtil from '@/modules/hmis/hmisUtil';
import { Client } from '@/types/gqlTypes';

const SearchResultsTable: React.FC<{
  rows: Client[];
}> = ({ rows }) => {
  const navigate = useNavigate();
  const headers = [
    'ID',
    'Social',
    'First Name',
    'Preferred Name',
    'Last Name',
    'DOB / Age',
  ];
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell sx={{ fontWeight: 600 }} key={header}>
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              onClick={() => navigate(`/client/${row.id}`)}
            >
              <TableCell component='th' scope='row'>
                {row.id}
              </TableCell>
              <TableCell>{row.ssnSerial}</TableCell>
              <TableCell>{row.firstName}</TableCell>
              <TableCell>{row.preferredName}</TableCell>
              <TableCell>{row.lastName}</TableCell>
              <TableCell>
                {row.dob && (
                  <Stack direction='row' spacing={1}>
                    <span>{HmisUtil.dob(row)}</span>
                    <span>{`(${HmisUtil.age(row)})`}</span>
                  </Stack>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SearchResultsTable;
