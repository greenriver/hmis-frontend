import { Paper } from '@mui/material';

import { ColumnDef } from '@/components/elements/GenericTable';
import PageTitle from '@/components/layout/PageTitle';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import {
  GetDeniedPendingReferralPostingsDocument,
  GetDeniedPendingReferralPostingsQuery,
  GetDeniedPendingReferralPostingsQueryVariables,
  ReferralPostingFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const rowLinkTo = (row: ReferralPostingFieldsFragment): string => {
  return generateSafePath(Routes.ADMIN_REFERRAL_DENIAL, {
    referralPostingId: row.id,
  });
};

const columns: ColumnDef<ReferralPostingFieldsFragment>[] = [
  {
    header: 'Referral ID',
    linkTreatment: true,
    render: (row: ReferralPostingFieldsFragment) => row.id,
  },
  {
    header: 'Requested Date',
    render: (row: ReferralPostingFieldsFragment) =>
      parseAndFormatDate(row.referralDate),
  },
  {
    header: 'Organization',
    render: (row: ReferralPostingFieldsFragment) => row.organizationName,
  },
  {
    header: 'Project',
    render: (row: ReferralPostingFieldsFragment) => row.referredBy,
  },
  {
    header: 'HOH Name',
    render: (row: ReferralPostingFieldsFragment) => row.hohName,
  },
  {
    header: 'HOH MCI ID',
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
        />
      </Paper>
    </>
  );
};
export default AdminReferralDenials;
