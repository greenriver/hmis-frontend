import { Skeleton } from '@mui/material';
import { Stack } from '@mui/system';
import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';

import { useIntakeAssessment } from './useIntakeAssessment';

import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

interface Props extends Omit<ButtonLinkProps, 'to' | 'ref'> {
  enrollmentId: string;
  clientId: string;
  enrollment: HouseholdClientFieldsFragment['enrollment'];
}

const FinishIntakeButton = ({
  enrollmentId,
  clientId,
  enrollment,
  ...props
}: Props) => {
  const [assessment, { loading }] = useIntakeAssessment(enrollmentId);

  const [existingIntakePath, intakeCompleted] = useMemo(() => {
    if (!assessment) return [];
    const path = generatePath(DashboardRoutes.EDIT_ASSESSMENT, {
      clientId,
      enrollmentId,
      assessmentId: assessment.id,
    });
    return [path, !assessment.inProgress];
  }, [assessment, enrollmentId, clientId]);

  const isNewOrInProgress = !existingIntakePath || !intakeCompleted;

  const canExit =
    !enrollment.inProgress && !enrollment.exitDate && intakeCompleted;

  if (loading)
    return <Skeleton variant='rectangular' width={110} height={30} />;

  return (
    <Stack direction='row' spacing={1}>
      {canExit ? (
        <ButtonLink variant='outlined' size='small' to='' {...props}>
          Exit
        </ButtonLink>
      ) : (
        <ButtonLink
          variant='outlined'
          data-testid='finishIntakeButton'
          color={isNewOrInProgress ? 'error' : 'primary'}
          to={
            loading
              ? ''
              : existingIntakePath ||
                generatePath(DashboardRoutes.NEW_ASSESSMENT, {
                  clientId,
                  enrollmentId,
                  assessmentRole: AssessmentRole.Intake.toLowerCase(),
                })
          }
          disabled={loading}
          {...props}
        >
          {isNewOrInProgress ? 'Finish Intake' : 'Update Intake'}
        </ButtonLink>
      )}
    </Stack>
  );
};

export default FinishIntakeButton;
