import LockIcon from '@mui/icons-material/Lock';
import { Chip, SxProps } from '@mui/material';
import React from 'react';
import { CheckIcon } from '@/components/elements/SemanticIcons';
import { CeReferralStepStatus } from '@/types/gqlTypes';

interface Props {
  status: CeReferralStepStatus;
  sx?: SxProps;
}

const ReferralStepStatusChip: React.FC<Props> = ({ status, sx }) => {
  const baseChipSx: SxProps = {
    borderRadius: 1,
    fontWeight: 600,
    ...sx,
  };

  switch (status) {
    case CeReferralStepStatus.Unavailable:
      return (
        <Chip
          icon={<LockIcon color='inherit' />}
          label='Locked'
          sx={{
            ...baseChipSx,
            backgroundColor: 'grayscale.surface',
            color: 'grayscale.light',
          }}
        />
      );
    case CeReferralStepStatus.Available:
      return (
        <Chip
          label='Not Started'
          sx={{
            ...baseChipSx,
            backgroundColor: 'warning.surface',
            color: 'warning.dark',
          }}
        />
      );
    case CeReferralStepStatus.InProgress:
      return (
        <Chip
          label='Started'
          sx={{
            ...baseChipSx,
            backgroundColor: 'primary.surface',
            color: 'primary.dark',
          }}
        />
      );
    case CeReferralStepStatus.Completed:
      return (
        <Chip
          icon={<CheckIcon color={'inherit'} />}
          label='Done'
          sx={{
            ...baseChipSx,
            backgroundColor: 'success.surface',
            color: 'success.dark',
          }}
        />
      );
    default:
      return '';
  }
};

export default ReferralStepStatusChip;
