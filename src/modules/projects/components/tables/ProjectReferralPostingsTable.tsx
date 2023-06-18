import { useCallback } from 'react';

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
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<ReferralPostingFieldsFragment>[] = [
  {
    header: 'ID',
    render: 'referralIdentifier',
  },
  {
    header: 'Referral Date',
    render: (row: ReferralPostingFieldsFragment) =>
      parseAndFormatDate(row.referralDate),
  },
  {
    header: 'HoH',
    render: 'hohName',
    linkTreatment: true,
  },
  {
    header: 'Household Size',
    render: 'householdSize',
  },
  {
    header: 'Referred By',
    render: 'referredBy',
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
  },
];

interface Props {
  projectId: string;
}

export const ProjectReferralPostingsTable: React.FC<Props> = ({
  projectId,
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
    />
  );
};
