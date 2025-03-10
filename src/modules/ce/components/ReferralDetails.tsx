import { Typography } from '@mui/material';
import React from 'react';
import { useReferralContext } from '@/modules/ce/components/ReferralNav';
import { CeReferralStatus } from '@/types/gqlTypes';

interface Props {}

const ReferralDetails: React.FC<Props> = () => {
  const { referral } = useReferralContext();

  return (
    <>
      <Typography variant={'h4'} component={'h2'}>
        Details
      </Typography>
      {/* Placeholder */}
      {referral.status === CeReferralStatus.Initialized && (
        <p>Referral not yet started</p>
      )}
      {referral.status === CeReferralStatus.InProgress && (
        <p>Referral in progress</p>
      )}
      {referral.status === CeReferralStatus.Accepted && (
        <p>Referral is completed!</p>
      )}
      {referral.status === CeReferralStatus.Rejected && (
        <p>Referral was declined</p>
      )}
    </>
  );
};

export default ReferralDetails;
