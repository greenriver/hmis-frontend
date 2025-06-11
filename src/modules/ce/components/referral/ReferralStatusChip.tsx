import { Chip, ChipProps } from '@mui/material';
import React from 'react';
import { InProgressIcon } from '@/components/elements/SemanticIcons';
import { CeReferralStatus } from '@/types/gqlTypes';

interface Props {
  status: CeReferralStatus;
  size?: ChipProps['size'];
}
const ReferralStatusChip: React.FC<Props> = ({ status, size }) => {
  const baseChipProps: ChipProps = {
    variant: 'status',
    size,
  };

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
