import { useCallback } from 'react';

import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  FormRole,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props extends Omit<ButtonLinkProps, 'to' | 'ref'> {
  enrollmentId: string;
  clientId: string;
  enrollment: HouseholdClientFieldsFragment['enrollment'];
  intake?: AssessmentFieldsFragment;
  annual?: AssessmentFieldsFragment;
  exit?: AssessmentFieldsFragment;
}

/* Action button for a single household member
 
if no intake assessment exists AND the enrollment is WIP: prompt to begin new intake
else if WIP intake exists: prompt to complete it
else if WIP exit exists: prompt to complete it
else if WIP annual exists: prompt to complete it
else if enrollment is non-WIP AND enrollment is non-Exited AND no Exit assessment exists: show exit button */
const HouseholdMemberActionButton = ({
  enrollmentId,
  clientId,
  enrollment,
  intake,
  annual,
  exit,
  ...props
}: Props) => {
  const pathToAssessment = useCallback(
    (role: FormRole, assessmentId?: string) =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId,
        enrollmentId,
        formRole: role.toLowerCase(),
        assessmentId,
      }),
    [clientId, enrollmentId]
  );

  const buttonProps = { color: 'error' };

  if (!intake && enrollment.inProgress) {
    return (
      <ButtonLink
        data-testid='beginIntake'
        to={pathToAssessment(FormRole.Intake)}
        {...buttonProps}
        {...props}
      >
        Finish Intake
      </ButtonLink>
    );
  }
  if (intake && intake.inProgress) {
    return (
      <ButtonLink
        data-testid='finishIntake'
        to={pathToAssessment(FormRole.Intake, intake.id)}
        {...buttonProps}
        {...props}
      >
        Finish Intake
      </ButtonLink>
    );
  }
  if (exit && exit.inProgress) {
    return (
      <ButtonLink
        data-testid='finishExit'
        to={pathToAssessment(FormRole.Exit, exit.id)}
        {...buttonProps}
        {...props}
      >
        Finish Exit
      </ButtonLink>
    );
  }
  if (annual && annual.inProgress) {
    return (
      <ButtonLink
        data-testid='finishAnnual'
        to={pathToAssessment(FormRole.Annual, annual.id)}
        {...buttonProps}
        {...props}
      >
        Finish Annual
      </ButtonLink>
    );
  }
  if (
    !enrollment.inProgress && // Enrollment is non-WIP
    !enrollment.exitDate && // Enrollment has not beed Exited
    !exit // Exit assessment does not exist
  ) {
    return (
      <ButtonLink
        data-testid='beginExit'
        to={pathToAssessment(FormRole.Exit)}
        {...buttonProps}
        color='primary'
        {...props}
      >
        Exit
      </ButtonLink>
    );
  }
  return null;
};

export default HouseholdMemberActionButton;
