import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { HmisEnums } from '@/types/gqlEnums';
import { ReferralPostingDetailFieldsFragment } from '@/types/gqlTypes';

type Row = ReferralPostingDetailFieldsFragment['householdMembers'][number];

const columns: ColumnDef<Row>[] = [
  {
    header: '',
    key: 'indicator',
    width: '1%',
    render: (row: Row) => (
      <HohIndicator relationshipToHoh={row.relationshipToHoH} />
    ),
  },
  {
    header: 'Name',
    render: ({ client }: Row) => (
      <ClientName
        client={client}
        linkToProfile={client.access.canViewEnrollmentDetails}
      />
    ),
  },
  {
    header: 'MCI ID',
    render: ({ client }: Row) => (
      <ExternalIdDisplay
        value={client.externalIds.find((c) => c.label == 'MCI ID')}
      />
    ),
  },
  {
    header: 'Relationship to HoH',
    render: (row: Row) => (
      <HmisEnum
        value={row.relationshipToHoH}
        enumMap={HmisEnums.RelationshipToHoH}
      />
    ),
  },
  {
    header: 'DOB / Age',
    render: ({ client }: Row) => <ClientDobAge client={client} reveal />,
  },
  // {
  //   header: 'Gender',
  //   render: ({ client }: Row) => (
  //     <MultiHmisEnum values={client.gender} enumMap={HmisEnums.Gender} />
  //   ),
  // },
];

interface Props {
  rows: ReferralPostingDetailFieldsFragment['householdMembers'];
}

const ReferralHouseholdMembersTable: React.FC<Props> = ({ rows }) => {
  return <GenericTable<Row> rows={rows} columns={columns} />;
};

export default ReferralHouseholdMembersTable;
