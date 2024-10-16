import { Paper } from '@mui/material';

import { useMemo } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { useReferralFilter } from '@/modules/referrals/components/useReferralFilter';
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

const AdminReferralDenials = () => {
  const { globalFeatureFlags: { externalReferrals } = {} } =
    useHmisAppSettings();

  const columns: ColumnDef<ReferralPostingFieldsFragment>[] = useMemo(
    () => [
      {
        header: 'Referral ID',
        linkTreatment: true,
        render: (row: ReferralPostingFieldsFragment) =>
          row.referralIdentifier || 'N/A',
        hide: !externalReferrals, // only show for external referral which have ID from another system
      },
      {
        header: 'Referral Date',
        render: (row: ReferralPostingFieldsFragment) =>
          parseAndFormatDate(row.referralDate),
      },

      {
        header: 'Project',
        render: (row: ReferralPostingFieldsFragment) =>
          row.project?.projectName,
      },
      {
        header: 'Organization',
        render: (row: ReferralPostingFieldsFragment) =>
          row.organization?.organizationName,
      },
      {
        header: 'HoH Name',
        render: (row: ReferralPostingFieldsFragment) => row.hohName,
      },
      {
        header: 'HoH MCI ID',
        render: (row: ReferralPostingFieldsFragment) => row.hohMciId,
        hide: !externalReferrals,
      },
      {
        header: 'Denied By',
        render: (row: ReferralPostingFieldsFragment) => {
          const action =
            row.status === ReferralPostingStatus.DeniedPendingStatus
              ? 'Denied by '
              : 'Denial Approved by ';
          return `${action}${row.statusUpdatedBy}`;
        },
      },
    ],
    [externalReferrals]
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
export default AdminReferralDenials;
