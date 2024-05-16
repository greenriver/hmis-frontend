import { Stack } from '@mui/material';
import { filter } from 'lodash-es';
import { useMemo } from 'react';
import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import EnrollmentSummaryCount from '@/modules/enrollment/components/EnrollmentSummaryCount';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ExternalIdentifierType,
  ReferralPostingDetailFieldsFragment,
} from '@/types/gqlTypes';

type Row = ReferralPostingDetailFieldsFragment['householdMembers'][number];

interface Props {
  rows: ReferralPostingDetailFieldsFragment['householdMembers'];
}

const ReferralHouseholdMembersTable: React.FC<Props> = ({ rows }) => {
  const hasAnyMci = useMemo(
    () =>
      rows.some((row) =>
        row.client.externalIds.some(
          (id) => id.type === ExternalIdentifierType.MciId
        )
      ),
    [rows]
  );

  const columns: ColumnDef<Row>[] = useMemo(
    () => [
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
          <ClientName client={client} linkToProfile />
        ),
      },
      {
        header: 'MCI ID',
        hide: !hasAnyMci,
        render: ({ client }: Row) => (
          <Stack gap={0.8}>
            {filter(client.externalIds, {
              type: ExternalIdentifierType.MciId,
            }).map((val) => (
              <ExternalIdDisplay key={val.id} value={val} />
            ))}
          </Stack>
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
        render: ({ client }: Row) => (
          <ClientDobAge client={client} alwaysShow />
        ),
      },
      {
        header: 'Open Enrollments',
        render: (row: Row) => {
          return (
            <EnrollmentSummaryCount
              enrollmentSummary={row.openEnrollmentSummary}
              clientId={row.client.id}
            />
          );
        },
      },
    ],
    [hasAnyMci]
  );
  return <GenericTable<Row> rows={rows} columns={columns} />;
};

export default ReferralHouseholdMembersTable;
