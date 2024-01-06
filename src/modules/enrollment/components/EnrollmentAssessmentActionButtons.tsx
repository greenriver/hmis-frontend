import { LoadingButton } from '@mui/lab';
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
import {
  AssessmentRole,
  useGetClientAssessmentEligibilitiesQuery,
} from '@/types/gqlTypes';
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

  const { data, error, loading } = useGetClientAssessmentEligibilitiesQuery({
    variables: { clientId, enrollmentId },
  });
  if (error) throw error;

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

    if (!data?.client) return [];

    const hudRoleTitles: Partial<Record<AssessmentRole, string>> = {
      INTAKE: 'HUD Intake Assessment',
      UPDATE: 'New HUD Update Assessment',
      EXIT: 'New HUD Exit Assessment',
      ANNUAL: 'New HUD Annual Assessment',
      POST_EXIT: 'New HUD Post-Exit Assessment',
    };

    data.client.assessmentEligibilities.forEach(({ id, role, title }) => {
      const items =
        role === 'INTAKE' || role === 'EXIT' ? topItems : bottomItems;
      items.push({
        key: id,
        to: getPath(role),
        title: hudRoleTitles[role] || title,
      });
    });

    return [
      ...topItems,
      ...(!isEmpty(topItems) && !isEmpty(bottomItems)
        ? [{ key: 'd1', divider: true }]
        : []),
      ...bottomItems,
    ];
  }, [data, getPath]);

  if (items.length === 0)
    return (
      <LoadingButton loading={loading} disabled={!loading}>
        Assessments
      </LoadingButton>
    );

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
