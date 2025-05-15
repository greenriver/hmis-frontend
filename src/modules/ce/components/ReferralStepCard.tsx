import {
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import React, { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/ReferralPage';
import ReferralStepAssignee from '@/modules/ce/components/ReferralStepAssignee';
import ReferralStepStatusChip from '@/modules/ce/components/ReferralStepStatusChip';
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

  const collapsed = step.status === CeReferralStepStatus.Completed;

  const stepLink = useMemo(() => {
    if (step.stepId) {
      return generateSafePath(ProjectDashboardRoutes.REFERRAL_STEP, {
        projectId,
        opportunityId,
        referralId: referral.id,
        stepId: step.stepId,
      });
    }
  }, [opportunityId, projectId, referral.id, step.stepId]);

  const updatedDateString = useMemo(() => {
    const dateString = parseHmisDateString(updatedAt);
    if (dateString) return formatRelativeDateTime(dateString);
    return updatedAt;
  }, [updatedAt]);

  return (
    <Card>
      <CardActionArea
        component={ButtonLink}
        to={stepLink || ''}
        sx={{
          color: 'black !important',
          ...(stepLink
            ? {}
            : {
                pointerEvents: 'none',
                color: 'grayscale.main',
              }),
          // TODO - update styles, hover, etc. pending discussion about click target.
        }}
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
              <CommonMenuButton
                iconButton={true}
                title={'step actions'}
                items={[
                  {
                    title: 'View Step',
                    key: 'view',
                    to: stepLink,
                  },
                ]}
              />
            </Stack>
            <Divider orientation='horizontal' flexItem />
          </>
        )}

        <CardContent>
          <ReferralStepStatusChip status={status} sx={{ mb: 1 }} />
          <Stack gap={2}>
            <Typography variant='h5' component='div'>
              {name}
            </Typography>
            {updatedBy && updatedDateString && (
              <Typography variant='caption' color='grayscale.main'>
                Last edited {updatedDateString} by {updatedBy.name}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ReferralStepCard;
