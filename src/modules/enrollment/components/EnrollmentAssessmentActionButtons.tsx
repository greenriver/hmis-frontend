import { Skeleton } from '@mui/material';
import { Stack } from '@mui/system';
import { useCallback, useMemo } from 'react';

import { useAssessmentEligibilities } from '../hooks/useAssessmentEligibilities';
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
  GetEnrollmentAssessmentEligibilitiesQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type FinishIntakeButtonProps = {
  enrollmentId: string;
  clientId: string;
};
const FinishIntakeButton: React.FC<FinishIntakeButtonProps> = ({
  enrollmentId,
  clientId,
}) => {
  const intakePath = generateSafePath(EnrollmentDashboardRoutes.INTAKE, {
    clientId,
    enrollmentId,
  });
  return (
    <ButtonLink color='error' variant='contained' to={intakePath}>
      Finish Intake
    </ButtonLink>
  );
};

type AssessmentEligibilityType = NonNullable<
  GetEnrollmentAssessmentEligibilitiesQuery['enrollment']
>['assessmentEligibilities'][0];

type Props = {
  enrollment: DashboardEnrollment;
};

const NewAssessmentMenu: React.FC<
  Props & { assessmentEligibilities: AssessmentEligibilityType[] }
> = ({ enrollment, assessmentEligibilities }) => {
  const enrollmentId = enrollment.id;
  const clientId = enrollment.client.id;

  const getPath = useCallback(
    (formRole: AssessmentRole, formDefinitionId?: string) => {
      // For intake and exit, navigate to the specific Intake/Exit page
      // so that assessment can be rendered in Household view if applicable
      if (formRole === AssessmentRole.Intake) {
        return generateSafePath(EnrollmentDashboardRoutes.INTAKE, {
          clientId,
          enrollmentId,
        });
      }
      if (formRole === AssessmentRole.Exit) {
        return generateSafePath(EnrollmentDashboardRoutes.EXIT, {
          clientId,
          enrollmentId,
        });
      }

      return generateSafePath(EnrollmentDashboardRoutes.NEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        formRole,
        formDefinitionId,
      });
    },
    [clientId, enrollmentId]
  );

  const items: NavMenuItem[] = useMemo(
    () =>
      assessmentEligibilities.map(({ id, title, role, formDefinitionId }) => ({
        key: id,
        to: getPath(role, formDefinitionId),
        title: title,
      })),
    [assessmentEligibilities, getPath]
  );

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

  const { assessmentEligibilities, loading } = useAssessmentEligibilities(
    enrollment.id
  );
  const numIncompleteEnrollments = useMemo(
    () =>
      (householdMembers || []).filter((c) => !!c.enrollment.inProgress).length,
    [householdMembers]
  );

  if (loading && !assessmentEligibilities) {
    return (
      <Skeleton variant='rectangular' aria-live='polite' aria-busy='true'>
        <CommonMenuButton title='New Assessment' items={[]} disabled />
      </Skeleton>
    );
  }

  return (
    <Stack direction='row' gap={2}>
      {(numIncompleteEnrollments > 0 || enrollment.inProgress) && (
        <FinishIntakeButton
          enrollmentId={enrollment.id}
          clientId={enrollment.client.id}
        />
      )}
      {!enrollment.inProgress && assessmentEligibilities && (
        <NewAssessmentMenu
          enrollment={enrollment}
          assessmentEligibilities={assessmentEligibilities}
        />
      )}
    </Stack>
  );
};

export default EnrollmentAssessmentActionButtons;
