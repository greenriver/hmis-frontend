import { Box, Card, Link, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import {
  AssigneesIcon,
  ClientIcon,
  ProjectIcon,
  StepCalendarIcon,
} from '@/components/elements/SemanticIcons';
import ReferralStepDatum from '@/modules/ce/components/referral/ReferralStepDatum';
import { getReferralLink } from '@/modules/ce/util';
import {
  clientNameFromRecordWithOptionalClient,
  formatRelativeDate,
  parseHmisDateString,
  stringifyArray,
} from '@/modules/hmis/hmisUtil';
import { UserCeReferralStepFieldsFragment } from '@/types/gqlTypes';

interface Props {
  step: UserCeReferralStepFieldsFragment;
  currentUserId: string;
}

const UserStepCard: React.FC<Props> = ({ step, currentUserId }) => {
  const { referral, assignees } = step;
  const path = getReferralLink(referral);

  const truncatedAssignees = useMemo(() => {
    if (assignees.length <= 1) return '';

    // Move the current user ("You") to the front of the list
    const assigneeNames = [
      ...assignees
        .filter((assignee) => assignee.id === currentUserId)
        .map(() => 'you'),
      ...assignees
        .filter((assignee) => assignee.id !== currentUserId)
        .map(({ name }) => name),
    ];

    if (assigneeNames.length <= 3) return stringifyArray(assigneeNames);

    return `${assigneeNames.slice(0, 3).join(', ')} +${assigneeNames.length - 3} more`;
  }, [assignees, currentUserId]);

  const availableSince = useMemo(() => {
    const date = parseHmisDateString(step.availableAt);
    return date ? formatRelativeDate(date) : undefined;
  }, [step.availableAt]);

  return (
    <Card
      sx={{
        backgroundColor: 'primary.100',
        borderColor: 'primary.100',
        transition: (theme) =>
          theme.transitions.create(['background-color', 'border-color'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
          }),
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'primary.200',
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

        <Box>
          {/* Step status can be of one of 2 values:
             "Available" = nobody has clicked "start" on the step yet.
             "In Progress" = at least one of the assignees has clicked "start" on the step.

             For steps with multiple assignees, it _may_ be useful to know that somebody else has "picked up" the step
             by clicking "start" on it. However the language of "available" vs "in progress" does not clearly communicate
             this, so we are opting to hide this status indicator for now, to limit confusion.
            <ReferralStepDatum sx={{ fontWeight: 700 }}>
               {startCase(step.status.replace('_', ' '))
            </ReferralStepDatum> */}

          <ReferralStepDatum Icon={StepCalendarIcon}>
            Assigned {availableSince}
          </ReferralStepDatum>

          {/* only show assignees if there are any besides the current user */}
          {assignees.length > 1 && (
            <ReferralStepDatum Icon={AssigneesIcon}>
              Assigned to {truncatedAssignees}
            </ReferralStepDatum>
          )}
        </Box>
        <Box>
          <ReferralStepDatum Icon={ProjectIcon}>
            {step.referral.targetProjectName}
          </ReferralStepDatum>

          <ReferralStepDatum Icon={ClientIcon}>
            {clientNameFromRecordWithOptionalClient(step.referral)}
          </ReferralStepDatum>
        </Box>
      </Box>
    </Card>
  );
};

export default UserStepCard;
