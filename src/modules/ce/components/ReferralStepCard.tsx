import { Divider, Paper, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useMemo } from 'react';
import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import { GoToIcon } from '@/components/elements/SemanticIcons';
import ReferralStepAssignee from '@/modules/ce/components/ReferralStepAssignee';
import ReferralStepStatusChip from '@/modules/ce/components/ReferralStepStatusChip';
import StartCeReferralStepButton from '@/modules/ce/components/StartCeReferralStepButton';
import {
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralFieldsFragment,
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
  referral: CeReferralFieldsFragment;
}

const ReferralStepCard: React.FC<Props> = ({ step, referral }) => {
  const { name, status, updatedBy, updatedAt } = step;
  const projectId = referral.opportunity.projectId;
  const opportunityId = referral.opportunity.id;

  const action = useMemo(() => {
    if (status === CeReferralStepStatus.Available) {
      return (
        <StartCeReferralStepButton
          step={step}
          referralId={referral.id}
          opportunityId={opportunityId}
          projectId={projectId}
        >
          Start
        </StartCeReferralStepButton>
      );
    }

    const buttonProps: ButtonLinkProps = {
      to: generateSafePath(ProjectDashboardRoutes.REFERRAL_STEP, {
        projectId,
        opportunityId,
        referralId: referral.id,
        stepId: step.stepId || '',
      }),
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
  }, [name, opportunityId, projectId, referral.id, status, step]);

  const collapsed = step.status === CeReferralStepStatus.Completed;
  const locked = step.status === CeReferralStepStatus.Unavailable;
  const paperSx = useMemo(() => {
    if (locked)
      return {
        color: 'grayscale.light',
      };
  }, [locked]);

  const lastUpdatedString = useMemo(() => {
    const dateString = parseHmisDateString(updatedAt);
    const at = dateString ? ` ${formatRelativeDateTime(dateString)}` : '';
    const by = updatedBy ? ` by ${updatedBy.name}` : '';
    if (at || by) return `Last edited${at}${by}`;
  }, [updatedAt, updatedBy]);

  return (
    <Paper sx={paperSx}>
      {!collapsed && (
        <>
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
        </>
      )}
      <Box p={2}>
        <ReferralStepStatusChip status={status} sx={{ mb: 2 }} />
        <Stack gap={1}>
          <Typography variant='h5' component='h3'>
            {name}
          </Typography>
          {lastUpdatedString && (
            <Typography variant='caption' color='grayscale.main'>
              {lastUpdatedString}
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default ReferralStepCard;
