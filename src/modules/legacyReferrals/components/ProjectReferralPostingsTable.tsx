import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/legacyReferrals/components/ReferralPostingStatusDisplay';
import { useReferralFilter } from '@/modules/legacyReferrals/hooks/useReferralFilter';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetProjectReferralPostingsDocument,
  GetProjectReferralPostingsQuery,
  GetProjectReferralPostingsQueryVariables,
  ReferralPostingFieldsFragment,
  ReferralPostingStatus,
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
        key: 'id',
        render: (row) => row.referralIdentifier || 'N/A',
        hide: !externalReferrals,
      },
      {
        header: 'Referral Date',
        key: 'date',
        render: (row: ReferralPostingFieldsFragment) =>
          parseAndFormatDate(row.referralDate),
      },
      {
        header: 'HoH',
        key: 'hoh',
        render: ({ hohName }: ReferralPostingFieldsFragment) =>
          hohName || 'Unnamed Client',
      },
      {
        header: 'Referred By',
        key: 'referredBy',
        render: 'referredBy',
        hide: !externalReferrals,
      },
      {
        header: 'Referred From',
        key: 'referredFrom',
        render: 'referredFrom',
        hide: externalReferrals,
      },
      {
        header: 'Status',
        key: 'status',
        render: (row: ReferralPostingFieldsFragment) => (
          <ReferralPostingStatusDisplay status={row.status} />
        ),
      },
      {
        header: 'Assigned Date',
        key: 'assignedDate',
        render: (row: ReferralPostingFieldsFragment) =>
          parseAndFormatDateTime(row.assignedDate),
        hide: !externalReferrals,
      },
      {
        header: 'Household Size',
        key: 'householdSize',
        render: 'householdSize',
      },
    ];
    return cols;
  }, [externalReferrals]);

  const referralFilter = useReferralFilter([
    ReferralPostingStatus.AssignedStatus,
    ReferralPostingStatus.AcceptedPendingStatus,
    ReferralPostingStatus.DeniedPendingStatus,
    ReferralPostingStatus.AcceptedStatus,
  ]);

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
      rowActionTitle='View Referral'
      defaultPageSize={10}
      filters={{ status: referralFilter }}
      defaultFilterValues={{
        status: [
          ReferralPostingStatus.AssignedStatus,
          ReferralPostingStatus.AcceptedPendingStatus,
          ReferralPostingStatus.DeniedPendingStatus,
        ],
      }}
      paginationItemName='incoming referral'
    />
  );
};

export default ProjectReferralPostingsTable;
