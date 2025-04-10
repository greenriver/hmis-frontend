import { Chip, ChipProps, SxProps } from '@mui/material';
import React from 'react';
import { InProgressIcon } from '@/components/elements/SemanticIcons';
import { CeReferralStatus } from '@/types/gqlTypes';

interface Props {
  status: CeReferralStatus;
}
const ReferralStatusChip: React.FC<Props> = ({ status }) => {
  const baseChipSx: SxProps = {
    borderWeight: '1px',
    borderColor: 'borders.main',
    borderStyle: 'solid',
    fontWeight: 600,
  };

  const baseChipProps: ChipProps = {
    size: 'small',
    variant: 'outlined',
    sx: baseChipSx,
  };

  // TODO(7393) - add styles and colors, and make sure all statuses are mapped correctly
  switch (status) {
    case CeReferralStatus.Initialized:
      return <Chip label='Eligible' {...baseChipProps} />;
    case CeReferralStatus.InProgress:
      return (
        <Chip
          label='In Process'
          {...baseChipProps}
          color='primary'
          icon={<InProgressIcon />}
        />
      );
    case CeReferralStatus.Accepted:
      return <Chip label='Approved' {...baseChipProps} />;
    case CeReferralStatus.Rejected:
      return <Chip label='Declined' {...baseChipProps} />;
    default:
      return '';
  }
};

export default ReferralStatusChip;
