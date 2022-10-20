import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  useGetEnrollmentAssessmentsQuery,
} from '@/types/gqlTypes';

interface Props extends Omit<ButtonLinkProps, 'to' | 'ref'> {
  enrollmentId: string;
  clientId: string;
}

const FinishIntakeButton = ({ enrollmentId, clientId, ...props }: Props) => {
  const { data } = useGetEnrollmentAssessmentsQuery({
    variables: { id: enrollmentId, role: AssessmentRole.Intake },
  });
  const existingIntakePath = useMemo(() => {
    if (!data?.enrollment?.assessments?.nodesCount) return;
    const id = data.enrollment.assessments.nodes[0].id;
    if (!id) return;
    return generatePath(DashboardRoutes.EDIT_ASSESSMENT, {
      clientId,
      enrollmentId,
      assessmentId: id,
    });
  }, [data, enrollmentId, clientId]);

  return (
    <ButtonLink
      variant='outlined'
      color='error'
      to={
        existingIntakePath ||
        generatePath(DashboardRoutes.NEW_ASSESSMENT, {
          clientId,
          enrollmentId,
          assessmentRole: AssessmentRole.Intake.toLowerCase(),
        })
      }
      {...props}
    >
      {existingIntakePath ? 'Finish Intake' : 'Start Intake'}
    </ButtonLink>
  );
};

export default FinishIntakeButton;
