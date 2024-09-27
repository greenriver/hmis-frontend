import { useEffect } from 'react';
import { EnrollmentDashboardRoutes } from '@/app/routes';
import Loading from '@/components/elements/Loading';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessmentFormController from '@/modules/assessments/components/IndividualAssessmentFormController';
import { useGetAssessmentQuery } from '@/types/gqlTypes';

/**
 * Renders an existing individual assessment.
 *
 * Note: used both for viewing and editing assessments. View/edit display
 * depends on user permissions and whether the assessment is WIP or Submitted.
 */
const IndividualAssessmentPage = () => {
  const { enrollment, client, overrideBreadcrumbTitles } =
    useEnrollmentDashboardContext();
  const { assessmentId } = useSafeParams() as { assessmentId: string };

  // Fetch the Assessment, and the definition attached to it
  const {
    data: assessmentData,
    loading: assessmentLoading,
    error: assessmentError,
  } = useGetAssessmentQuery({ variables: { id: assessmentId } });

  const assessment = assessmentData?.assessment;

  // Set the breadcrumb so it says the correct name of this assessment
  useEffect(() => {
    overrideBreadcrumbTitles({
      [EnrollmentDashboardRoutes.VIEW_ASSESSMENT]:
        assessment?.definition?.title,
    });
  }, [overrideBreadcrumbTitles, assessment]);

  if (assessmentError) throw assessmentError;
  if (!enrollment) return <NotFound />;
  if (!assessmentData && assessmentLoading) return <Loading />;

  if (!assessment) return <NotFound />;

  return (
    <IndividualAssessmentFormController
      enrollment={enrollment}
      client={client}
      viewingDefinition={assessment.definition}
      editingDefinition={
        assessment.upgradedDefinitionForEditing || assessment.definition
      }
      assessment={assessment}
    />
  );
};

export default IndividualAssessmentPage;
