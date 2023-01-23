import { useOutletContext } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessment from '@/modules/assessments/components/IndividualAssessment';
import { AssessmentRole } from '@/types/gqlTypes';

const AssessmentPage = () => {
  const { client, enrollment } = useOutletContext<DashboardContext>();
  const { enrollmentId, assessmentId, assessmentRole } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    assessmentId?: string; // If editing, we have the assessment ID.
    assessmentRole?: AssessmentRole; // If create new, we have the role.
  };

  if (!enrollment) return <Loading />;

  return (
    <IndividualAssessment
      enrollmentId={enrollmentId}
      assessmentId={assessmentId}
      assessmentRole={assessmentRole}
      client={client}
      relationshipToHoH={enrollment.relationshipToHoH}
    />
  );
};

export default AssessmentPage;
