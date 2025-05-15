import { Chip, ChipProps, SxProps } from '@mui/material';
import React from 'react';
import { InProgressIcon } from '@/components/elements/SemanticIcons';
import { CeReferralStatus } from '@/types/gqlTypes';

interface Props {
  status: CeReferralStatus;
}
const ReferralStatusChip: React.FC<Props> = ({ status }) => {
  const baseChipSx: SxProps = {
    fontWeight: 600,
    fontSize: '14px',
    backgroundColor: 'grayscale.surface',
  };

  const baseChipProps: ChipProps = {
    sx: baseChipSx,
  };

  switch (status) {
    case CeReferralStatus.Initialized:
    case CeReferralStatus.InProgress:
      return (
        <Chip
          label='In Progress'
          {...baseChipProps}
          sx={{
            ...baseChipSx,
            backgroundColor: 'primary.surface',
            color: 'primary.dark',
          }}
          color='primary'
          icon={
            <InProgressIcon
              sx={{
                '&.MuiChip-icon': {
                  color: 'primary.main',
                },
              }}
            />
          }
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
