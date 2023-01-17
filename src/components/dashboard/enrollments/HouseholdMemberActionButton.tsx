import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  AssessmentRole,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

interface Props extends Omit<ButtonLinkProps, 'to' | 'ref'> {
  enrollmentId: string;
  clientId: string;
  enrollment: HouseholdClientFieldsFragment['enrollment'];
  intake?: AssessmentFieldsFragment;
  annual?: AssessmentFieldsFragment;
  exit?: AssessmentFieldsFragment;
}

// if no intake assessment exists AND the enrollment is WIP: prompt to begin new intake
// else if WIP intake exists: prompt to complete it
// else if WIP exit exists: prompt to complete it
// else if WIP annual exists: prompt to complete it
// else if enrollment is non-WIP AND enrollment is non-Exited AND no Exit assessment exists: show exit button

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
    (id: string) =>
      generatePath(DashboardRoutes.EDIT_ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: id,
      }),
    [clientId, enrollmentId]
  );
  const pathToNewAssessment = useCallback(
    (role: AssessmentRole) =>
      generatePath(DashboardRoutes.NEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentRole: role.toLowerCase(),
      }),
    [clientId, enrollmentId]
  );

  const buttonProps = { color: 'error' };

  if (!intake && enrollment.inProgress) {
    return (
      <ButtonLink
        data-testid='beginIntake'
        to={pathToNewAssessment(AssessmentRole.Intake)}
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
        to={pathToAssessment(intake.id)}
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
        to={pathToAssessment(exit.id)}
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
        to={pathToAssessment(annual.id)}
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
        to={pathToNewAssessment(AssessmentRole.Exit)}
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
