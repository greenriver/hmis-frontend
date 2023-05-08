import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import {
  GetProjectReferralRequestsDocument,
  GetProjectReferralRequestsQuery,
  GetProjectReferralRequestsQueryVariables,
  ReferralRequestFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<ReferralRequestFieldsFragment>[] = [
  {
    header: 'Date needed',
    render: (row: ReferralRequestFieldsFragment) =>
      parseAndFormatDateRange(row.neededBy),
  },
  {
    header: 'Unit Type',
    render: (row: ReferralRequestFieldsFragment) => row.unitType,
  },
  {
    header: 'Requestor',
    render: (row: ReferralRequestFieldsFragment) => (
      <>
        {`${row.requestorName} <${row.requestorEmail}>`}
        <br />
        {row.requestorPhone}
      </>
    ),
  },
  {
    header: 'requested on',
    render: 'requestedOn',
  },
];

interface Props {
  projectId: string;
}

const ProjectReferralRequestsTable: React.FC<Props> = ({ projectId }) => {
  return (
    <GenericTableWithData<
      GetProjectReferralRequestsQuery,
      GetProjectReferralRequestsQueryVariables,
      ReferralRequestFieldsFragment
    >
      queryVariables={{ id: projectId }}
      queryDocument={GetProjectReferralRequestsDocument}
      columns={columns}
      noData='No referral requests.'
      pagePath='project.referralRequests'
    />
  );
};
export default ProjectReferralRequestsTable;
