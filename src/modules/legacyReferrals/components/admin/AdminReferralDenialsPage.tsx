import { Paper } from '@mui/material';

import { useMemo } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import { useGlobalFeatureFlags } from '@/hooks/useGlobalFeatureFlags';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { useReferralFilter } from '@/modules/legacyReferrals/hooks/useReferralFilter';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetDeniedPendingReferralPostingsDocument,
  GetDeniedPendingReferralPostingsQuery,
  GetDeniedPendingReferralPostingsQueryVariables,
  ReferralPostingFieldsFragment,
  ReferralPostingStatus,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const rowLinkTo = (row: ReferralPostingFieldsFragment): string => {
  return generateSafePath(AdminDashboardRoutes.AC_DENIAL_DETAILS, {
    referralPostingId: row.id,
  });
};

const AdminReferralDenialsPage = () => {
  const { globalFeatureFlags: { externalReferralsEnabled } = {} } =
    useGlobalFeatureFlags();

  const columns: ColumnDef<ReferralPostingFieldsFragment>[] = useMemo(
    () => [
      {
        header: 'Referral ID',
        key: 'referralId',
        render: (row: ReferralPostingFieldsFragment) =>
          row.referralIdentifier || 'N/A',
        hide: !externalReferralsEnabled, // only show for external referral which have ID from another system
      },
      {
        header: 'Referral Date',
        key: 'referralDate',
        render: (row: ReferralPostingFieldsFragment) =>
          parseAndFormatDate(row.referralDate),
      },
      {
        header: 'Project',
        key: 'project',
        render: (row: ReferralPostingFieldsFragment) =>
          row.project?.projectName,
      },
      {
        header: 'Organization',
        key: 'organization',
        render: (row: ReferralPostingFieldsFragment) =>
          row.organization?.organizationName,
      },
      {
        header: 'HoH Name',
        key: 'hohName',
        render: (row: ReferralPostingFieldsFragment) => row.hohName,
      },
      {
        header: 'HoH MCI ID',
        key: 'hohMciId',
        render: (row: ReferralPostingFieldsFragment) => row.hohMciId,
        hide: !externalReferralsEnabled,
      },
      {
        header: 'Denied By',
        key: 'deniedBy',
        render: (row: ReferralPostingFieldsFragment) => {
          const action =
            row.status === ReferralPostingStatus.DeniedPendingStatus
              ? 'Denied by '
              : 'Denial Approved by ';
          return `${action}${row.statusUpdatedBy}`;
        },
      },
    ],
    [externalReferralsEnabled]
  );

  const referralFilter = useReferralFilter([
    ReferralPostingStatus.DeniedPendingStatus,
    ReferralPostingStatus.DeniedStatus,
  ]);

  return (
    <>
      <PageTitle title='Denials' />
      <Paper>
        <GenericTableWithData<
          GetDeniedPendingReferralPostingsQuery,
          GetDeniedPendingReferralPostingsQueryVariables,
          ReferralPostingFieldsFragment
        >
          queryVariables={{}}
          queryDocument={GetDeniedPendingReferralPostingsDocument}
          columns={columns}
          noData='No denials'
          pagePath='deniedPendingReferralPostings'
          rowLinkTo={rowLinkTo}
          rowActionTitle='View Referral'
          defaultPageSize={25}
          filters={{ status: referralFilter }}
          defaultFilterValues={{
            status: [ReferralPostingStatus.DeniedPendingStatus],
          }}
          paginationItemName='denied referral'
        />
      </Paper>
    </>
  );
};
export default AdminReferralDenialsPage;
