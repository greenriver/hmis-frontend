import { useCallback } from 'react';

import { ReferralPostingStatusDisplay } from '../ReferralPostingStatusDisplay';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
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
    header: 'Requested Date',
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
      parseAndFormatDate(row.assignedDate),
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
