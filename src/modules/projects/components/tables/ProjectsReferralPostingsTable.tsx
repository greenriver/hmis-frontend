import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  GetProjectReferralPostingsDocument,
  GetProjectReferralPostingsQuery,
  GetProjectReferralPostingsQueryVariables,
  ReferralPostingFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<ReferralPostingFieldsFragment>[] = [
  {
    header: 'Requested Date',
    render: (row: ReferralPostingFieldsFragment) =>
      parseAndFormatDate(row.referralDate),
  },
];

interface Props {
  projectId: string;
}

export const ProjectReferralPostingsTable: React.FC<Props> = ({
  projectId,
}) => {
  return (
    <GenericTableWithData<
      GetProjectReferralPostingsQuery,
      GetProjectReferralPostingsQueryVariables,
      ReferralPostingFieldsFragment
    >
      queryVariables={{ id: projectId }}
      queryDocument={GetProjectReferralPostingsDocument}
      columns={columns}
      noData='No referral postings'
      pagePath='project.incomingReferralPostings'
    />
  );
};
