import Loading from '@/components/elements/Loading';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessmentPage from '@/modules/assessments/components/IndividualAssessmentPage';
import MissingDefinitionAlert from '@/modules/assessments/components/MissingDefinitionAlert';
import useAssessmentFormDefinition from '@/modules/assessments/hooks/useAssessmentFormDefinition';

/**
 * Renders blank assessment(s), for an individual or a household.
 */
const NewAssessmentPage = () => {
  const { enrollment, client } = useEnrollmentDashboardContext();
  const { formDefinitionId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    formDefinitionId?: string;
  };

  // Fetch the FormDefinition. This also applies "data collected about" changes to form.
  const { formDefinition, loading } = useAssessmentFormDefinition({
    formDefinitionId,
    projectId: enrollment?.project.id || '',
    client,
    relationshipToHoH: enrollment?.relationshipToHoH,
  });

  if (!enrollment) return <NotFound />;
  if (loading && !formDefinition) return <Loading />;
  if (!formDefinition) return <MissingDefinitionAlert />;

  return (
    <IndividualAssessmentPage
      enrollment={enrollment}
      client={client}
      definition={formDefinition}
    />
  );
};

export default NewAssessmentPage;
