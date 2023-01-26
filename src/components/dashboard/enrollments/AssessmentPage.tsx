import { useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessment from '@/modules/assessments/components/IndividualAssessment';
import { cache } from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const AssessmentPage = () => {
  const { client, enrollment } = useOutletContext<DashboardContext>();
  const { clientId, enrollmentId, assessmentId, assessmentRole } =
    useSafeParams() as {
      clientId: string;
      enrollmentId: string;
      assessmentId?: string; // If editing, we have the assessment ID.
      assessmentRole?: AssessmentRole; // If create new, we have the role.
    };
  const navigate = useNavigate();

  // TODO test make sure this works
  const onSuccess = useCallback(() => {
    // If we created a NEW assessment, clear assessment queries from cache before navigating so the table reloads
    if (!assessmentId) {
      cache.evict({
        id: `Enrollment:${enrollmentId}`,
        fieldName: 'assessments',
      });
    }
    navigate(
      generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
        enrollmentId,
        clientId,
      })
    );
  }, [enrollmentId, clientId, navigate, assessmentId]);

  if (!enrollment) return <Loading />;

  return (
    <IndividualAssessment
      enrollmentId={enrollmentId}
      assessmentId={assessmentId}
      assessmentRole={assessmentRole}
      client={client}
      relationshipToHoH={enrollment.relationshipToHoH}
      onSuccess={onSuccess}
    />
  );
};

export default AssessmentPage;
