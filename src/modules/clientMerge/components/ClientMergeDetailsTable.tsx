import { Typography } from '@mui/material';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import {
  ClientIdentificationFieldsFragment,
  ClientNameFragment,
} from '@/types/gqlTypes';

type ClientType = ClientNameFragment & ClientIdentificationFieldsFragment;

interface Props {
  clients: ClientType[];
}

// TODO: add more details like race, gender, enrollment history
const columns: ColumnDef<ClientType>[] = [
  { header: 'First Name', render: 'firstName' },
  { header: 'Middle Name', render: 'middleName' },
  { header: 'Last Name', render: 'lastName' },
  { header: 'Name Suffix', render: 'nameSuffix' },
  { header: 'SSN', render: 'ssn' },
  {
    header: 'DOB',
    render: (client) => <ClientDobAge client={client} alwaysShow />,
  },
];

const ClientMergeDetailsTable: React.FC<Props> = ({ clients }) => {
  return (
    <GenericTable<ClientType>
      columns={columns}
      vertical
      rows={clients}
      tableProps={{
        size: 'small',
        stickyHeader: true,
        width: 'fit-content',
      }}
      renderVerticalHeaderCell={(record) => {
        return <Typography variant='body2'>Record {record.id}</Typography>;
      }}
    />
  );
};
export default ClientMergeDetailsTable;
