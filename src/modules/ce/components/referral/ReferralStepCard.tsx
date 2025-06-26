import { Box, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import ReferralStepDetails from './ReferralStepDetails';
import ReferralStepAction from '@/modules/ce/components/referral/ReferralStepAction';
import {
  CeReferralFieldsFragment,
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
  referral: CeReferralFieldsFragment;
  path: string;
}

const ReferralStepCard: React.FC<Props> = ({ step, referral, path }) => {
  const { name, status } = step;

  return (
    <Paper
      sx={{
        p: 2,
        ...(status === CeReferralStepStatus.Unavailable
          ? { color: 'grayscale.main' }
          : {}),
      }}
    >
      <Stack gap={1}>
        <Typography variant='body1' fontWeight='bold' component='h3'>
          {name}
        </Typography>

        <ReferralStepDetails step={step} />

        <Box sx={{ alignSelf: 'start' }}>
          <ReferralStepAction
            step={step}
            referralId={referral.id}
            path={path}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

export default ReferralStepCard;
