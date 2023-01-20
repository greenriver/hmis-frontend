import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessment from '@/modules/assessments/components/IndividualAssessment';
import { AssessmentRole } from '@/types/gqlTypes';

const AssessmentPage = () => {
  const { enrollmentId, assessmentId, assessmentRole } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    assessmentId?: string; // If editing, we have the assessment ID.
    assessmentRole?: AssessmentRole; // If create new, we have the role.
  };

  return (
    <IndividualAssessment
      enrollmentId={enrollmentId}
      assessmentId={assessmentId}
      assessmentRole={assessmentRole}
    />
  );
};

export default AssessmentPage;
