import { Box, Card, Link, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import React, { useMemo } from 'react';
import {
  AssigneesIcon,
  ClientIcon,
  DaysAvailableIcon,
  InfoIcon,
  ProjectIcon,
} from '@/components/elements/SemanticIcons';
import {
  clientNameFromRecordWithOptionalClient,
  formatRelativeDate,
  parseHmisDateString,
  stringifyArray,
} from '@/modules/hmis/hmisUtil';
import TooltipKeyValue from '@/modules/myDashboard/components/TooltipKeyValue';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { UserCeReferralStepFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  step: UserCeReferralStepFieldsFragment;
  currentUserId: string;
}

const UserStepCard: React.FC<Props> = ({ step, currentUserId }) => {
  const { referral } = step;
  // todo @martha - this is going to be a merge conflict
  const path = generateSafePath(ProjectDashboardRoutes.REFERRAL_DETAILS, {
    projectId: referral.targetProjectId,
    opportunityId: referral.opportunity.id,
    referralId: referral.id,
  });

  const truncatedAssignees = useMemo(() => {
    const { assignees } = step;

    // Move the current user ("You") to the front of the list
    const assigneeNames = [
      ...assignees
        .filter((assignee) => assignee.id === currentUserId)
        .map(() => 'You'),
      ...assignees
        .filter((assignee) => assignee.id !== currentUserId)
        .map(({ name }) => name),
    ];

    if (assigneeNames.length <= 3) return stringifyArray(assigneeNames);

    return `${assigneeNames.slice(0, 3).join(', ')} +${assigneeNames.length - 3} more`;
  }, [currentUserId, step]);

  const availableSince = useMemo(() => {
    const date = parseHmisDateString(step.availableAt);
    return date ? formatRelativeDate(date) : undefined;
  }, [step.availableAt]);

  return (
    <Card
      sx={{
        mx: 2,
        my: 1,
        backgroundColor: 'primary.surface',
        borderColor: 'primary.100',
        transition: (theme) =>
          theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
          }),
        '&:hover': {
          borderColor: 'primary.300',
          backgroundColor: 'primary.100',
        },
      }}
    >
      <Box
        // Box instead of Mui's CardActionArea to avoid unwanted hover color.
        // (CardActionArea does not get us anything besides ripple effect, which we disable anyway)
        component={Link}
        href={path}
        sx={{
          display: 'block',
          px: 2,
          py: 1,
          textDecoration: 'none',
          '&:focus': {
            outlineColor: '-webkit-focus-ring-color',
            outlineWidth: '2px',
            outlineStyle: 'auto',
            outlineOffset: '-2px',
          },
        }}
      >
        <Typography
          variant='body2'
          fontWeight='bold'
          color='text.primary'
          sx={{ mb: 0.5 }}
        >
          {step.name}
        </Typography>

        <TooltipKeyValue title={'Status'} Icon={InfoIcon}>
          {startCase(step.status.replace('_', ' '))}
        </TooltipKeyValue>

        <TooltipKeyValue title={'Assignees'} Icon={AssigneesIcon}>
          {truncatedAssignees}
        </TooltipKeyValue>

        <TooltipKeyValue title={'Client'} Icon={ClientIcon}>
          {clientNameFromRecordWithOptionalClient(step.referral)}
        </TooltipKeyValue>

        <TooltipKeyValue title={'Project'} Icon={ProjectIcon}>
          {step.referral.targetProjectName}
        </TooltipKeyValue>

        <TooltipKeyValue title={'Available Since'} Icon={DaysAvailableIcon}>
          {availableSince}
        </TooltipKeyValue>
      </Box>
    </Card>
  );
};

export default UserStepCard;
