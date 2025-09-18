import { Chip, ChipProps } from '@mui/material';

import { HmisEnums } from '@/types/gqlEnums';
import { ReferralPostingStatus } from '@/types/gqlTypes';

interface Props extends ChipProps {
  status: ReferralPostingStatus;
}

const ReferralPostingStatusDisplay: React.FC<Props> = ({
  status,
  sx,
  variant = 'filled',
  ...props
}) => {
  if (status === ReferralPostingStatus.AcceptedPendingStatus) {
    // TODO set color
  } else if (status === ReferralPostingStatus.DeniedPendingStatus) {
    // TODO set color
  }

  return (
    <Chip
      label={HmisEnums.ReferralPostingStatus[status]}
      variant={variant}
      sx={{
        cursor: 'inherit',
        px: 1,
        ...sx,
      }}
      size='small'
      {...props}
    />
  );
};

export default ReferralPostingStatusDisplay;
