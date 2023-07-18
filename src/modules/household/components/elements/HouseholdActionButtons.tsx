import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PeopleIcon from '@mui/icons-material/People';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { Stack } from '@mui/material';
import { useMemo } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  householdMembers: HouseholdClientFieldsFragment[];
  enrollmentId: string;
  clientId: string;
}

/**
 * Action buttons for an entire household
 */
const HouseholdActionButtons = ({
  householdMembers,
  enrollmentId,
  clientId,
}: Props) => {
  const individual = householdMembers.length === 1;
  // TODO: should make exit red if there are exits in progress
  const [canExit, exitReason] = useMemo(() => {
    // Single-member household
    // if (householdMembers.length < 2) return [false];
    // All members have exited
    if (!householdMembers.find((c) => !c.enrollment.exitDate)) {
      return [true];
    }
    // Some members have incomplete enrollments
    if (householdMembers.find((c) => c.enrollment.inProgress)) {
      return [false, 'Cannot exit household with incomplete enrollments.'];
    }
    return [true];
  }, [householdMembers]);

  const [canIntake, intakeReason, intakeColor] = useMemo(() => {
    // Single-member household
    // if (householdMembers.length < 2) return [false];
    const numIncomplete = householdMembers.filter(
      (c) => !!c.enrollment.inProgress
    ).length;
    // All members have completed intake
    if (numIncomplete === 0) {
      return [true, null, 'secondary'];
    }

    let message = `${numIncomplete} members have incomplete intakes.`;
    if (numIncomplete === 1) message = `1 member has an incomplete intake.`;
    return [true, message, 'error'];
  }, [householdMembers]);

  return (
    <Stack direction='row' gap={3} sx={{ mt: 4, mb: 4 }}>
      <ButtonLink
        Icon={PeopleIcon}
        to={generateSafePath(EnrollmentDashboardRoutes.EDIT_HOUSEHOLD, {
          clientId,
          enrollmentId,
        })}
        color='secondary'
      >
        Manage Household
      </ButtonLink>
      {(canIntake || intakeReason) && (
        <ButtonTooltipContainer title={intakeReason} placement='bottom'>
          <ButtonLink
            disabled={!canIntake}
            color={intakeColor}
            icon={PostAddIcon}
            to={generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
              clientId,
              enrollmentId,
              formRole: AssessmentRole.Intake,
            })}
          >
            {individual ? 'Intake Assessment' : 'Household Intakes'}
          </ButtonLink>
        </ButtonTooltipContainer>
      )}
      {(canExit || exitReason) && (
        <ButtonTooltipContainer title={exitReason} placement='bottom'>
          <ButtonLink
            disabled={!canExit}
            icon={ExitToAppIcon}
            to={generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
              clientId,
              enrollmentId,
              formRole: AssessmentRole.Exit,
            })}
          >
            {individual ? 'Exit Assessment' : 'Household Exits'}
          </ButtonLink>
        </ButtonTooltipContainer>
      )}
    </Stack>
  );
};

export default HouseholdActionButtons;
