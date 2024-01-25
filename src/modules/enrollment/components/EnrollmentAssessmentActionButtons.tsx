import { Skeleton } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useMemo } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import CommonMenuButton, {
  NavMenuItem,
} from '@/components/elements/CommonMenuButton';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  useGetEnrollmentAssessmentEligibilitiesQuery,
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
  const intakePath = generateSafePath(
    EnrollmentDashboardRoutes.VIEW_ASSESSMENT,
    {
      clientId,
      enrollmentId,
      assessmentId,
    }
  );
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

  const { data, error, loading } = useGetEnrollmentAssessmentEligibilitiesQuery(
    {
      fetchPolicy: 'cache-and-network',
      variables: { enrollmentId },
    }
  );

  if (error) throw error;

  const getPath = useCallback(
    (formRole: AssessmentRole, formDefinitionId?: string) =>
      generateSafePath(EnrollmentDashboardRoutes.NEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        formRole,
        formDefinitionId,
      }),
    [clientId, enrollmentId]
  );

  const items: NavMenuItem[] = useMemo(() => {
    if (!data?.enrollment) return [];

    return data.enrollment.assessmentEligibilities.map(
      ({ id, title, role, formDefinitionId }) => ({
        key: id,
        to: getPath(role, formDefinitionId),
        title: title,
      })
    );
  }, [data, getPath]);

  if (loading && !data) {
    return (
      <Skeleton variant='rectangular' aria-live='polite' aria-busy='true'>
        <CommonMenuButton title='New Assessment' items={[]} disabled />
      </Skeleton>
    );
  }
  if (items.length === 0) {
    return (
      <ButtonTooltipContainer
        title={'Cannot perform new assessments for exited enrollment.'}
      >
        <CommonMenuButton title='New Assessment' items={[]} disabled />
      </ButtonTooltipContainer>
    );
  }

  return <CommonMenuButton title='New Assessment' items={items} />;
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
