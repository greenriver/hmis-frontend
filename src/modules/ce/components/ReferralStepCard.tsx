import { Divider, Paper, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useMemo } from 'react';
import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import { GoToIcon } from '@/components/elements/SemanticIcons';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/ReferralPage';
import ReferralStepAssignee from '@/modules/ce/components/ReferralStepAssignee';
import ReferralStepStatusChip from '@/modules/ce/components/ReferralStepStatusChip';
import StartCeReferralStepButton from '@/modules/ce/components/StartCeReferralStepButton';
import {
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
}

const ReferralStepCard: React.FC<Props> = ({ step }) => {
  const { projectId, opportunityId } = useSafeParams() as {
    projectId: string;
    opportunityId: string;
  };
  const { referral } = useReferralContext();
  const { name, status, updatedBy, updatedAt } = step;

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
      ariaLabel: `View step: ${name}`,
    };

    if (status === CeReferralStepStatus.InProgress) {
      return <ButtonLink {...buttonProps}>View</ButtonLink>;
    }

    if (status === CeReferralStepStatus.Completed) {
      return (
        <ButtonLink {...buttonProps} color='grayscale'>
          View
        </ButtonLink>
      );
    }
  }, [name, opportunityId, projectId, referral.id, status, step]);

  const collapsed = step.status === CeReferralStepStatus.Completed;
  const locked = step.status === CeReferralStepStatus.Unavailable;

  const updatedDateString = useMemo(() => {
    const dateString = parseHmisDateString(updatedAt);
    if (dateString) return formatRelativeDateTime(dateString);
    return updatedAt;
  }, [updatedAt]);

  return (
    <Paper
      sx={
        locked
          ? {
              color: 'grayscale.light',
            }
          : {}
      }
    >
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
          {updatedBy && updatedDateString && (
            <Typography variant='caption' color='grayscale.main'>
              Last edited {updatedDateString} by {updatedBy.name}
            </Typography>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default ReferralStepCard;
