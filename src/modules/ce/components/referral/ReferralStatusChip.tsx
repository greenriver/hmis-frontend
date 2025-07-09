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

  if (customStatus) {
    return (
      <Chip
        label={customStatus.name}
        color='primary'
        icon={<InProgressIcon />}
        {...baseChipProps}
      />
    );
  }

  switch (status) {
    case CeReferralStatus.Initialized:
    case CeReferralStatus.InProgress:
      return (
        <Chip
          label='In Progress'
          color='primary'
          icon={<InProgressIcon />}
          {...baseChipProps}
        />
      );
    case CeReferralStatus.Accepted:
      return <Chip label='Accepted' {...baseChipProps} />;
    case CeReferralStatus.Rejected:
      return <Chip label='Declined' {...baseChipProps} />;
    default:
      return '';
  }
};

export default ReferralStatusChip;
