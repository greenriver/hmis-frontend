import { Stack } from '@mui/system';
import { isEmpty } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import CommonMenuButton, {
  NavMenuItem,
} from '@/components/elements/CommonMenuButton';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type FinishIntakeButtonProps = {
  enrollmentId: string;
  clientId: string;
  assessmentId?: string;
};
const FinishIntakeButton: React.FC<FinishIntakeButtonProps> = ({
  enrollmentId,
  clientId,
  assessmentId,
}) => {
  const intakePath = generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
    clientId,
    enrollmentId,
    formRole: AssessmentRole.Intake,
    assessmentId,
  });
  return (
    <ButtonLink color='error' variant='contained' to={intakePath}>
      Finish Intake
    </ButtonLink>
  );
};

type Props = { enrollment: DashboardEnrollment };

const NewAssessmentMenu: React.FC<Props> = ({ enrollment }) => {
  const enrollmentId = enrollment.id;
  const clientId = enrollment.client.id;

  const getPath = useCallback(
    (formRole: AssessmentRole) =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId,
        enrollmentId,
        formRole,
      }),
    [clientId, enrollmentId]
  );

  const items: NavMenuItem[] = useMemo(() => {
    const topItems: NavMenuItem[] = [];
    const bottomItems: NavMenuItem[] = [];

    // Edge case: show "intake" item if the client is entered but does not have an intake
    if (!enrollment.intakeAssessment) {
      topItems.push({
        key: 'intake',
        to: getPath(AssessmentRole.Intake),
        title: 'HUD Intake Assessment',
      });
    }

    // Exit/Update/Annual can only be added to open enrollment
    if (!enrollment.exitDate) {
      topItems.push({
        key: 'exit',
        to: getPath(AssessmentRole.Exit),
        title: 'HUD Exit Assessment',
      });
      bottomItems.push(
        {
          key: 'update',
          to: getPath(AssessmentRole.Update),
          title: 'New HUD Update Assessment',
        },
        {
          key: 'annual',
          to: getPath(AssessmentRole.Annual),
          title: 'New HUD Annual Assessment',
        }
      );
    }

    return [
      ...topItems,
      ...(!isEmpty(topItems) && !isEmpty(bottomItems)
        ? [{ key: 'd1', divider: true }]
        : []),
      ...bottomItems,
    ];
  }, [enrollment, getPath]);

  if (isEmpty(items)) return null;

  return <CommonMenuButton title='Assessments' items={items} />;
};

const EnrollmentAssessmentActionButtons: React.FC<Props> = ({ enrollment }) => {
  const [householdMembers] = useHouseholdMembers(enrollment.id);

  const numIncompleteEnrollments = useMemo(
    () =>
      (householdMembers || []).filter((c) => !!c.enrollment.inProgress).length,
    [householdMembers]
  );

  return (
    <Stack direction='row' gap={2}>
      {(numIncompleteEnrollments > 0 || enrollment.inProgress) && (
        <FinishIntakeButton
          enrollmentId={enrollment.id}
          clientId={enrollment.client.id}
          assessmentId={enrollment.intakeAssessment?.id}
        />
      )}
      {!enrollment.inProgress && <NewAssessmentMenu enrollment={enrollment} />}
    </Stack>
  );
};

export default EnrollmentAssessmentActionButtons;
