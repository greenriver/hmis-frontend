import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import ReferralStepDetails from './ReferralStepDetails';
import ButtonLink from '@/components/elements/ButtonLink';
import StartCeReferralStepButton from '@/modules/ce/components/referral/StartCeReferralStepButton';
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

  const action = useMemo(() => {
    if (status === CeReferralStepStatus.Available) {
      return (
        <StartCeReferralStepButton
          step={step}
          referralId={referral.id}
          path={path}
        >
          Start
        </StartCeReferralStepButton>
      );
    }

    if (status === CeReferralStepStatus.Unavailable) {
      return <Button disabled>Start</Button>;
    }

    if (status === CeReferralStepStatus.InProgress) {
      return (
        <ButtonLink
          variant='contained'
          to={path}
          aria-label={`View step: ${name}`}
        >
          View
        </ButtonLink>
      );
    }

    if (status === CeReferralStepStatus.Completed) {
      return (
        <ButtonLink
          aria-label={`View step: ${name}`}
          to={path}
          color='grayscale'
        >
          View
        </ButtonLink>
      );
    }
  }, [name, path, referral.id, status, step]);

  return (
    <Paper
      sx={{
        p: 3,
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
        <Box sx={{ alignSelf: 'start' }}>{action}</Box>
      </Stack>
    </Paper>
  );
};

export default ReferralStepCard;
