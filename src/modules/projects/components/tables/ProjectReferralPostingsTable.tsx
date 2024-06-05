import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetProjectReferralPostingsDocument,
  GetProjectReferralPostingsQuery,
  GetProjectReferralPostingsQueryVariables,
  ReferralPostingFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  projectId: string;
  externalReferrals?: boolean;
}

const ProjectReferralPostingsTable: React.FC<Props> = ({
  projectId,
  externalReferrals,
}) => {
  const rowLinkTo = useCallback(
    (row: ReferralPostingFieldsFragment): string => {
      return generateSafePath(ProjectDashboardRoutes.REFERRAL_POSTING, {
        projectId,
        referralPostingId: row.id,
      });
    },
    [projectId]
  );

  const columns = useMemo(() => {
    const cols: ColumnDef<ReferralPostingFieldsFragment>[] = [
      {
        header: 'Referral ID',
        render: (row) => row.referralIdentifier || 'N/A',
        hide: !externalReferrals,
      },
      {
        header: 'Referral Date',
        render: (row: ReferralPostingFieldsFragment) =>
          parseAndFormatDate(row.referralDate),
      },
      {
        header: 'HoH',
        render: ({ hohName }: ReferralPostingFieldsFragment) =>
          hohName || 'Unnamed Client',
        linkTreatment: true,
      },
      {
        header: 'Referred By',
        render: 'referredBy',
        hide: !externalReferrals,
      },
      {
        header: 'Referred From',
        render: 'referredFrom',
        hide: externalReferrals,
      },
      {
        header: 'Status',
        render: (row: ReferralPostingFieldsFragment) => (
          <ReferralPostingStatusDisplay status={row.status} />
        ),
      },
      {
        header: 'Assigned Date',
        render: (row: ReferralPostingFieldsFragment) =>
          parseAndFormatDateTime(row.assignedDate),
        hide: !externalReferrals,
      },
      {
        header: 'Household Size',
        render: 'householdSize',
      },
    ];
    return cols;
  }, [externalReferrals]);

  return (
    <GenericTableWithData<
      GetProjectReferralPostingsQuery,
      GetProjectReferralPostingsQueryVariables,
      ReferralPostingFieldsFragment
    >
      queryVariables={{ id: projectId }}
      queryDocument={GetProjectReferralPostingsDocument}
      columns={columns}
      noData='No referrals'
      pagePath='project.incomingReferralPostings'
      rowLinkTo={rowLinkTo}
      defaultPageSize={25}
    />
  );
};

export default ProjectReferralPostingsTable;
