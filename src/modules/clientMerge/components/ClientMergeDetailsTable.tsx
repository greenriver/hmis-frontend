import { Typography } from '@mui/material';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import RestrictedRecordBadge from '@/modules/client/components/RestrictedRecordBadge';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientIdentificationFieldsFragment,
  ClientNameFragment,
  ClientSsnFieldsFragment,
} from '@/types/gqlTypes';

type ClientType = ClientNameFragment &
  ClientIdentificationFieldsFragment &
  ClientSsnFieldsFragment & {
    restricted?: boolean;
  };

interface Props {
  clients: ClientType[];
}

// TODO: add more details like race, gender, enrollment history
const columns: ColumnDef<ClientType>[] = [
  { header: 'First Name', render: 'firstName', key: 'firstName' },
  { header: 'Middle Name', render: 'middleName', key: 'middleName' },
  { header: 'Last Name', render: 'lastName', key: 'lastName' },
  { header: 'Name Suffix', render: 'nameSuffix', key: 'nameSuffix' },
  { header: 'SSN', render: 'ssn', key: 'ssn' },
  {
    header: 'DOB',
    key: 'dob',
    render: (client) => <ClientDobAge client={client} alwaysShow />,
  },
  {
    header: 'Gender',
    key: 'gender',
    render: (client) => (
      <MultiHmisEnum values={client.gender} enumMap={HmisEnums.Gender} />
    ),
  },
  {
    header: 'Restricted Record',
    key: 'restricted',
    render: (client) => (client.restricted ? <RestrictedRecordBadge /> : null),
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
