import { Divider, Paper, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useMemo } from 'react';
import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import { GoToIcon } from '@/components/elements/SemanticIcons';
import ReferralStepAssignee from '@/modules/ce/components/referral/ReferralStepAssignee';
import ReferralStepStatusChip from '@/modules/ce/components/referral/ReferralStepStatusChip';
import StartCeReferralStepButton from '@/modules/ce/components/referral/StartCeReferralStepButton';
import { lastUpdatedBy } from '@/modules/hmis/hmisUtil';
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
  const { name, status, updatedBy, updatedAt } = step;

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

    const buttonProps: ButtonLinkProps = {
      to: path,
      variant: 'text',
      endIcon: <GoToIcon />,
    };

    if (status === CeReferralStepStatus.InProgress) {
      return (
        <ButtonLink aria-label={`View step: ${name}`} {...buttonProps}>
          View
        </ButtonLink>
      );
    }

    if (status === CeReferralStepStatus.Completed) {
      return (
        <ButtonLink
          aria-label={`View step: ${name}`}
          {...buttonProps}
          color='grayscale'
        >
          View
        </ButtonLink>
      );
    }
  }, [name, path, referral.id, status, step]);

  const locked = step.status === CeReferralStepStatus.Unavailable;
  const paperSx = useMemo(() => {
    if (locked)
      return {
        color: 'grayscale.main',
      };
  }, [locked]);

  return (
    <Paper sx={paperSx}>
      <Stack
        sx={{ px: 2, py: 1 }}
        direction='row'
        alignItems='center'
        justifyContent='space-between'
      >
        <ReferralStepAssignee step={step} />
        {action}
      </Stack>
      <Divider orientation='horizontal' flexItem />
      <Box p={2}>
        <Stack gap={1}>
          <ReferralStepStatusChip status={status} sx={{ alignSelf: 'start' }} />
          <Typography variant='h5' component='h3'>
            {name}
          </Typography>
          {!!updatedAt && (
            <Typography variant='caption' color='grayscale.main'>
              Last updated{' '}
              {lastUpdatedBy({
                dateUpdated: updatedAt,
                user: updatedBy,
                relativeDate: true,
              })}
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default ReferralStepCard;
