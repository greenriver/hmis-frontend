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
  switch (status) {
    case CeReferralStepStatus.Unavailable:
      return (
        <Chip
          icon={<LockIcon />}
          label='Locked'
          variant='status'
          color='grayscale'
          sx={sx}
        />
      );
    case CeReferralStepStatus.Available:
      return (
        <Chip label='Not Started' color='warning' variant='status' sx={sx} />
      );
    case CeReferralStepStatus.InProgress:
      return (
        <Chip label='In Progress' color='primary' variant='status' sx={sx} />
      );
    case CeReferralStepStatus.Completed:
      return (
        <Chip
          icon={<CheckIcon color={'inherit'} />}
          label='Done'
          color='success'
          variant='status'
          sx={sx}
        />
      );
    default:
      return '';
  }
};

export default ReferralStepStatusChip;
