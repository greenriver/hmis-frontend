import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// FIXME make generic Table component

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
    'DOB',
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
              <TableCell>{row.ssn}</TableCell>
              <TableCell>{row.firstName}</TableCell>
              <TableCell>{row.preferredName}</TableCell>
              <TableCell>{row.lastName}</TableCell>
              <TableCell>{row.dob}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SearchResultsTable;
