import { Chip, ChipProps } from '@mui/material';
import React from 'react';
import { InProgressIcon } from '@/components/elements/SemanticIcons';
import { CeReferralFieldsFragment, CeReferralStatus } from '@/types/gqlTypes';

interface Props {
  referral: Pick<CeReferralFieldsFragment, 'status' | 'customStatus'>;
  size?: ChipProps['size'];
}
const ReferralStatusChip: React.FC<Props> = ({ referral, size }) => {
  const { status, customStatus } = referral;

  const baseChipProps: ChipProps = {
    variant: 'status',
    size,
  };

  switch (status) {
    case CeReferralStatus.Initialized:
    case CeReferralStatus.InProgress:
      return (
        <Chip
          label={customStatus?.name || 'In Progress'}
          color='primary'
          icon={<InProgressIcon />}
          {...baseChipProps}
        />
      );
    case CeReferralStatus.Accepted:
      return (
        <Chip label={customStatus?.name || 'Accepted'} {...baseChipProps} />
      );
    case CeReferralStatus.Rejected:
      return (
        <Chip label={customStatus?.name || 'Declined'} {...baseChipProps} />
      );
    default:
      return '';
  }
};

export default ReferralStatusChip;
