import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { Stack } from '@mui/material';
import { useMemo } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { useIsMobile } from '@/hooks/useIsMobile';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { findHohOrRep } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { HouseholdClientFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  householdMembers: HouseholdClientFieldsFragment[];
}

/**
 * Action buttons for an entire household
 */
const HouseholdActionButtons = ({ householdMembers }: Props) => {
  const { enrollment } = useEnrollmentDashboardContext();
  // If rendered on the enrollment dashboard, link to the same enrollment.
  // If rendered elsewhere (project dash household creation), link to HoH enrollment.
  const routeParams = useMemo(() => {
    if (enrollment) {
      return { clientId: enrollment.client.id, enrollmentId: enrollment.id };
    }
    const hoh = findHohOrRep(householdMembers);
    return {
      clientId: hoh.client.id,
      enrollmentId: hoh.enrollment.id,
    };
  }, [enrollment, householdMembers]);

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

  const [canIntake, intakeReason, intakeColor] = useMemo<
    [boolean, string | null, 'error' | undefined]
  >(() => {
    // Single-member household
    // if (householdMembers.length < 2) return [false];
    const numIncomplete = householdMembers.filter(
      (c) => !!c.enrollment.inProgress
    ).length;
    // All members have completed intake
    if (numIncomplete === 0) {
      return [true, null, undefined];
    }

    let message = `${numIncomplete} members have incomplete intakes.`;
    if (numIncomplete === 1) message = `1 member has an incomplete intake.`;
    return [true, message, 'error'];
  }, [householdMembers]);

  const isTiny = useIsMobile('sm');

  return (
    <Stack direction={isTiny ? 'column' : 'row'} gap={{ xs: 1, sm: 2, md: 3 }}>
      {(canIntake || intakeReason) && (
        <ButtonTooltipContainer title={intakeReason} placement='bottom'>
          <ButtonLink
            disabled={!canIntake}
            color={intakeColor}
            Icon={PostAddIcon}
            to={generateSafePath(EnrollmentDashboardRoutes.INTAKE, routeParams)}
            sx={{
              width: { xs: '100%', sm: 'fit-content' },
              textAlign: 'center',
            }}
          >
            {individual ? 'Intake Assessment' : 'Household Intakes'}
          </ButtonLink>
        </ButtonTooltipContainer>
      )}
      {/* only show exit assessment link if all members have completed intake, and if rendered on enrollment dashboard (to avoid displaying immediately after auto-enter into project) */}
      {(canExit || exitReason) && enrollment && (
        <ButtonTooltipContainer title={exitReason} placement='bottom'>
          <ButtonLink
            disabled={!canExit}
            Icon={ExitToAppIcon}
            to={generateSafePath(EnrollmentDashboardRoutes.EXIT, routeParams)}
            sx={{
              width: { xs: '100%', sm: 'fit-content' },
              textAlign: 'center',
            }}
          >
            {individual ? 'Exit Assessment' : 'Household Exits'}
          </ButtonLink>
        </ButtonTooltipContainer>
      )}
    </Stack>
  );
};

export default HouseholdActionButtons;
