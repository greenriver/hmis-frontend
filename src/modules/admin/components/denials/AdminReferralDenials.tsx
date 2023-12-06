import { Paper } from '@mui/material';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  GetDeniedPendingReferralPostingsDocument,
  GetDeniedPendingReferralPostingsQuery,
  GetDeniedPendingReferralPostingsQueryVariables,
  ReferralPostingFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const rowLinkTo = (row: ReferralPostingFieldsFragment): string => {
  return generateSafePath(AdminDashboardRoutes.AC_DENIAL_DETAILS, {
    referralPostingId: row.id,
  });
};

const columns: ColumnDef<ReferralPostingFieldsFragment>[] = [
  {
    header: 'Referral ID',
    linkTreatment: true,
    render: (row: ReferralPostingFieldsFragment) =>
      row.referralIdentifier || 'N/A',
  },
  {
    header: 'Referral Date',
    render: (row: ReferralPostingFieldsFragment) =>
      parseAndFormatDate(row.referralDate),
  },
  {
    header: 'Project',
    render: (row: ReferralPostingFieldsFragment) => row.project?.projectName,
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
  },
  {
    header: 'Denied By',
    render: (row: ReferralPostingFieldsFragment) => row.statusUpdatedBy,
  },
];

const AdminReferralDenials = () => {
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
        />
      </Paper>
    </>
  );
};
export default AdminReferralDenials;
