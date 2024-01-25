import { useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessmentPage from '@/modules/assessments/components/IndividualAssessmentPage';
import { applyDefinitionRulesForClient } from '@/modules/form/util/formUtil';
import { useGetAssessmentQuery } from '@/types/gqlTypes';

/**
 * Renders existing assessment(s), for an individual or a household
 */
const AssessmentPage = () => {
  const { enrollment, client } = useEnrollmentDashboardContext();
  const { assessmentId } = useSafeParams() as { assessmentId: string };

  // Fetch the Assessment, and the definition attached to it
  const {
    data: assessmentData,
    loading: assessmentLoading,
    error: assessmentError,
  } = useGetAssessmentQuery({ variables: { id: assessmentId } });

  // Retrieve the Definition from the Assessment, and apply any "Data Collected About" rules to it
  const definition = useMemo(() => {
    if (!assessmentData?.assessment?.definition || !enrollment) return;

    return applyDefinitionRulesForClient(
      assessmentData?.assessment?.definition,
      client,
      enrollment.relationshipToHoH
    );
  }, [assessmentData, client, enrollment]);

  if (assessmentError) throw assessmentError;
  if (!enrollment) return <NotFound />;
  if (!assessmentData && assessmentLoading) return <Loading />;

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
