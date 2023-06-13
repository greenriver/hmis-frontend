import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { CommonUntyledList } from '@/components/CommonUnstyledList';
import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import {
  ReferralPostingDetailFieldsFragment,
  ReferralPostingStatus,
} from '@/types/gqlTypes';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
}
const AdminReferralPostingDetails: React.FC<Props> = ({ referralPosting }) => {
  const list: Array<[string, ReactNode]> = [
    [
      'Referral Status',
      <ReferralPostingStatusDisplay
        status={referralPosting.status}
        size='small'
        variant='filled'
        color='secondary'
        sx={{ mt: 0.5 }}
      />,
    ],
    ['Referral ID', referralPosting.referralIdentifier],
    ['Referral Date', parseAndFormatDate(referralPosting.referralDate)],
    ['Project Name', referralPosting.referredFrom],
    ['Organization Name', referralPosting.organizationName],
  ];
  if (referralPosting.status === ReferralPostingStatus.DeniedPendingStatus) {
    list.push([
      'Referral denied at',
      parseAndFormatDate(referralPosting.statusNoteUpdatedAt),
    ]);
    list.push(['Denied by', referralPosting.statusNoteUpdatedBy]);
  }

  return (
    <Stack spacing={2} component={CommonUntyledList} sx={{ columns: 2 }}>
      {list
        .filter((labelValue) => hasMeaningfulValue(labelValue[1]))
        .map(([label, value]) => (
          <Typography component='li' key={label} variant='body2'>
            <Box
              sx={({ typography }) => ({
                fontWeight: typography.fontWeightBold,
              })}
            >
              {label}
            </Box>
            {value || <NotCollectedText variant='body2' />}
          </Typography>
        ))}
    </Stack>
  );
};

export default AdminReferralPostingDetails;
