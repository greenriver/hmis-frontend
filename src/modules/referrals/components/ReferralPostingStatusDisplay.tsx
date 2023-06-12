import { Chip, ChipProps } from '@mui/material';

import { HmisEnums } from '@/types/gqlEnums';
import { ReferralPostingStatus } from '@/types/gqlTypes';

interface Props extends ChipProps {
  status: ReferralPostingStatus;
}
const ReferralPostingStatusDisplay: React.FC<Props> = ({
  status,
  sx,
  variant = 'outlined',
  ...props
}) => {
  return (
    <Chip
      label={HmisEnums.ReferralPostingStatus[status]}
      variant={variant}
      sx={{ cursor: 'inherit', ...sx }}
      {...props}
    />
  );
};

export default ReferralPostingStatusDisplay;
