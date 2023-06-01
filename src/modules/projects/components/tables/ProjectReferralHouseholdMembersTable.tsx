import GenericTable, { ColumnDef } from '@/components/elements/GenericTable';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { clientBriefName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
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
    header: 'Member Name',
    render: ({ client }: Row) => clientBriefName(client),
  },
  {
    header: 'Relationship to HoH',
    render: (row: Row) => HmisEnums.RelationshipToHoH[row.relationshipToHoH],
  },
  {
    header: 'Birth Date',
    render: ({ client }: Row) =>
      client.dob ? parseAndFormatDate(client.dob) : '',
  },
  {
    header: 'Gender',
    render: ({ client }: Row) =>
      client.gender.map((g) => HmisEnums.Gender[g]).join(', '),
  },
];

interface Props {
  rows: ReferralPostingDetailFieldsFragment['householdMembers'];
}

export const ProjectReferralHouseholdMembersTable: React.FC<Props> = ({
  rows,
}) => {
  return <GenericTable<Row> rows={rows} columns={columns} />;
};
