import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  GetProjectReferralRequestsDocument,
  GetProjectReferralRequestsQuery,
  GetProjectReferralRequestsQueryVariables,
  ReferralRequestFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<ReferralRequestFieldsFragment>[] = [
  {
    header: 'Requested Date',
    render: (row: ReferralRequestFieldsFragment) =>
      parseAndFormatDate(row.requestedOn),
  },
  {
    header: 'Unit Type',
    render: (row: ReferralRequestFieldsFragment) => row.unitType.description,
  },
  {
    header: 'Estimated Date Needed',
    render: (row: ReferralRequestFieldsFragment) =>
      parseAndFormatDate(row.neededBy),
  },
  {
    header: 'Requestor Details',
    render: (row: ReferralRequestFieldsFragment) => (
      <>
        {`${row.requestorName} <${row.requestorEmail}>`}
        <br />
        {row.requestorPhone}
      </>
    ),
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
