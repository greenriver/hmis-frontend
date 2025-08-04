import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referral: CeReferralFieldsFragment;
}

const DetailText = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant='body2'
    color='primary.dark'
    fontWeight='bold'
    sx={{
      overflow: 'hidden',
      textWrap: 'nowrap',
      textOverflow: 'ellipsis',
      maxWidth: 250,
    }}
  >
    {children}
  </Typography>
);

const ReferralMetadataHeader: React.FC<Props> = ({ referral }) => (
  <Box
    sx={{
      backgroundColor: 'primary.100',
      borderRadius: 1,
      padding: 1,
    }}
  >
    <Stack
      direction='row'
      alignItems='center'
      gap={2}
      justifyContent={'space-between'}
      sx={{ '.MuiChip-root': { backgroundColor: 'transparent' } }}
    >
      <ReferralStatusChip status={referral.status} size='small' />
      <Stack direction='row' alignItems='center' gap={2.5}>
        <DetailText>{referral.clientName}</DetailText>
        <DetailText>{referral.targetProjectName}</DetailText>
      </Stack>
    </Stack>
  </Box>
);

export default ReferralMetadataHeader;
