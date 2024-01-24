import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/elements/Loading';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useIsPrintView from '@/hooks/useIsPrintView';
import useSafeParams from '@/hooks/useSafeParams';
import HouseholdAssessments from '@/modules/assessments/components/household/HouseholdAssessments';
import { isHouseholdAssesmentRole } from '@/modules/assessments/components/household/util';
import IndividualAssessmentPage from '@/modules/assessments/components/IndividualAssessmentPage';
import { applyDefinitionRulesForClient } from '@/modules/form/util/formUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  FormRole,
  useGetAssessmentQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const showAssessmentInHousehold = (
  enrollment?: EnrollmentFieldsFragment,
  role?: string
): boolean => {
  return !!(
    enrollment &&
    role &&
    enrollment.householdSize > 1 &&
    isHouseholdAssesmentRole(role)
  );
};

/**
 * Renders existing assessment(s), for an individual or a household
 */
const AssessmentPage = () => {
  const { enrollment, client } = useEnrollmentDashboardContext();
  const { clientId, enrollmentId, assessmentId, formRole } =
    useSafeParams() as {
      clientId: string;
      enrollmentId: string;
      formRole: FormRole;
      assessmentId?: string;
    };
  const isPrintView = useIsPrintView();
  const renderHouseholdView =
    showAssessmentInHousehold(enrollment, formRole) && !isPrintView;

  // Fetch the Assessment (and the Definition which is resolved on it)
  const {
    data: assessmentData,
    loading: assessmentLoading,
    error: assessmentError,
  } = useGetAssessmentQuery({
    variables: { id: assessmentId || '' },
    skip: !assessmentId || renderHouseholdView, // skip for household view, it handles fetching separately
  });

  // Retrieve the Definition from the Assessment, and apply any "Data Collected About" rules to it
  const definition = useMemo(() => {
    if (!assessmentData?.assessment?.definition || !enrollment) return;
    return applyDefinitionRulesForClient(
      assessmentData?.assessment?.definition,
      client,
      enrollment.relationshipToHoH
    );
  }, [assessmentData, client, enrollment]);

  const navigate = useNavigate();

  if (assessmentError) throw assessmentError;
  if (!enrollment) return <NotFound />;
  if (!formRole) return <NotFound />;
  if (assessmentId && !assessmentData && assessmentLoading) return <Loading />;

  if (!assessmentId) {
    // here for backwards compatibility
    return navigate(
      generateSafePath(EnrollmentDashboardRoutes.NEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        formRole,
      })
    );
  }
  // If household has 2+ members and this is a household assessment, render household workflow
  if (
    showAssessmentInHousehold(enrollment, formRole) &&
    !isPrintView &&
    isHouseholdAssesmentRole(formRole)
  ) {
    return (
      <HouseholdAssessments
        role={formRole}
        enrollment={enrollment}
        assessmentId={assessmentId}
      />
    );
  }

  const assessment = assessmentData?.assessment;
  if (!assessment || !definition) return <NotFound />;

  return (
    <IndividualAssessmentPage
      enrollment={enrollment}
      client={client}
      definition={definition}
      assessment={assessment}
    />
  );
};

export default AssessmentPage;
