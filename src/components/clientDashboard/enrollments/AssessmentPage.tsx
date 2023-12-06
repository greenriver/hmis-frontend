import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useIsPrintView from '@/hooks/useIsPrintView';
import useSafeParams from '@/hooks/useSafeParams';
import HouseholdAssessments from '@/modules/assessments/components/household/HouseholdAssessments';
import { isHouseholdAssesmentRole } from '@/modules/assessments/components/household/util';
import IndividualAssessmentPage from '@/modules/assessments/components/IndividualAssessmentPage';
import { EnrollmentFieldsFragment, FormRole } from '@/types/gqlTypes';

export const showAssessmentInHousehold = (
  enrollment?: EnrollmentFieldsFragment,
  role?: string
) => {
  return (
    enrollment &&
    role &&
    enrollment.householdSize > 1 &&
    isHouseholdAssesmentRole(role)
  );
};

const AssessmentPage = () => {
  const { enrollment, client } = useEnrollmentDashboardContext();
  const { assessmentId, formRole } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    formRole: FormRole;
    assessmentId?: string;
  };
  const isPrintView = useIsPrintView();

  if (!enrollment) return <NotFound />;
  if (!formRole) return <NotFound />;

  // If household has 2+ members and this is a household assessment, render household workflow
  if (
    isHouseholdAssesmentRole(formRole) &&
    showAssessmentInHousehold(enrollment, formRole) &&
    !isPrintView
  ) {
    return (
      <HouseholdAssessments
        role={formRole}
        enrollment={enrollment}
        assessmentId={assessmentId}
      />
    );
  }

  return <IndividualAssessmentPage enrollment={enrollment} client={client} />;
};

export default AssessmentPage;
