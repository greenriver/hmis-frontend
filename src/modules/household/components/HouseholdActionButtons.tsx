import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PeopleIcon from '@mui/icons-material/People';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { Stack } from '@mui/material';
import { useCallback, useMemo } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { DashboardRoutes } from '@/routes/routes';
import { HouseholdClientFieldsWithAssessmentsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  householdMembers: HouseholdClientFieldsWithAssessmentsFragment[];
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
  const [canExit, exitReason] = useMemo(() => {
    // Single-member household
    if (householdMembers.length < 2) return [false];
    // All members have exited
    if (!householdMembers.find((c) => !c.enrollment.exitDate)) {
      return [false];
    }
    // Some members have incomplete enrollments
    if (householdMembers.find((c) => c.enrollment.inProgress)) {
      return [false, 'Cannot exit household with incomplete enrollments.'];
    }
    return [true];
  }, [householdMembers]);

  const [canIntake, intakeReason] = useMemo(() => {
    // Single-member household
    if (householdMembers.length < 2) return [false];
    const numIncomplete = householdMembers.filter(
      (c) => !!c.enrollment.inProgress
    ).length;
    // All members have completed intake
    if (numIncomplete === 0) {
      return [false];
    }

    let message = `${numIncomplete} members have incomplete intakes.`;
    if (numIncomplete === 1) message = `1 member has an incomplete intake.`;
    return [true, message];
  }, [householdMembers]);

  const buildPath = useCallback(
    (route: string) => generateSafePath(route, { clientId, enrollmentId }),
    [clientId, enrollmentId]
  );

  return (
    <Stack direction='row' gap={3} sx={{ mt: 4, mb: 2 }}>
      <ButtonLink
        Icon={PeopleIcon}
        to={buildPath(DashboardRoutes.EDIT_HOUSEHOLD)}
      >
        Manage Household
      </ButtonLink>
      {(canIntake || intakeReason) && (
        <ButtonTooltipContainer title={intakeReason} placement='bottom'>
          <ButtonLink
            disabled={!canIntake}
            color='error'
            icon={PostAddIcon}
            to={buildPath(DashboardRoutes.HOUSEHOLD_INTAKE)}
          >
            Household Intake
          </ButtonLink>
        </ButtonTooltipContainer>
      )}
      {(canExit || exitReason) && (
        <ButtonTooltipContainer title={exitReason} placement='bottom'>
          <ButtonLink
            disabled={!canExit}
            icon={ExitToAppIcon}
            to={buildPath(DashboardRoutes.HOUSEHOLD_EXIT)}
          >
            Exit Household
          </ButtonLink>
        </ButtonTooltipContainer>
      )}
    </Stack>
  );
};

export default HouseholdActionButtons;
