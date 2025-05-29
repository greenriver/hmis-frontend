import { SvgIconComponent } from '@mui/icons-material';
import { Box, Card, Link, SxProps, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import React, { ReactNode, useMemo } from 'react';
import {
  AssigneesIcon,
  ClientIcon,
  DaysAvailableIcon,
  ProjectIcon,
} from '@/components/elements/SemanticIcons';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getReferralLink } from '@/modules/ce/util';
import {
  clientNameFromRecordWithOptionalClient,
  formatRelativeDate,
  parseHmisDateString,
  stringifyArray,
} from '@/modules/hmis/hmisUtil';
import { UserCeReferralStepFieldsFragment } from '@/types/gqlTypes';

// internal component for common styles in the caption-text info under the step title
const StepCardInfo: React.FC<{
  children: ReactNode;
  sx?: SxProps;
  Icon?: SvgIconComponent;
}> = ({ children, sx, Icon }) => {
  const isMobile = useIsMobile('sm');

  return (
    <Typography
      variant='caption'
      color='text.secondary'
      component={isMobile ? 'p' : 'span'}
      sx={sx}
    >
      <Box
        component='span'
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          mr: isMobile ? 0 : 2,
        }}
      >
        {Icon && <Icon fontSize='inherit' color='inherit' />}
        {children}
      </Box>
    </Typography>
  );
};

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
          backgroundColor: 'primary.300',
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
          <StepCardInfo sx={{ fontWeight: 700 }}>
            {startCase(step.status.replace('_', ' '))}
          </StepCardInfo>

          <StepCardInfo Icon={DaysAvailableIcon}>
            Assigned {availableSince}
          </StepCardInfo>

          {/* only show assignees if there are any besides the current user */}
          {assignees.length > 1 && (
            <StepCardInfo Icon={AssigneesIcon}>
              Assigned to {truncatedAssignees}
            </StepCardInfo>
          )}
        </Box>
        <Box>
          <StepCardInfo Icon={ProjectIcon}>
            {step.referral.targetProjectName}
          </StepCardInfo>

          <StepCardInfo Icon={ClientIcon}>
            {clientNameFromRecordWithOptionalClient(step.referral)}
          </StepCardInfo>
        </Box>
      </Box>
    </Card>
  );
};

export default UserStepCard;
