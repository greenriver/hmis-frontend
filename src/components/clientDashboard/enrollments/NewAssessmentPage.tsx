import { useEffect } from 'react';
import Loading from '@/components/elements/Loading';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessmentPage from '@/modules/assessments/components/IndividualAssessmentPage';
import MissingDefinitionAlert from '@/modules/assessments/components/MissingDefinitionAlert';
import useAssessmentFormDefinition from '@/modules/assessments/hooks/useAssessmentFormDefinition';
import { EnrollmentDashboardRoutes } from '@/routes/routes';

/**
 * Renders blank assessment(s), for an individual or a household.
 */
const NewAssessmentPage = () => {
  const { enrollment, client, overrideBreadcrumbTitles } =
    useEnrollmentDashboardContext();
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

  // Set the breadcrumb so it says the correct name of this assessment
  useEffect(() => {
    overrideBreadcrumbTitles({
      [EnrollmentDashboardRoutes.NEW_ASSESSMENT]: formDefinition?.title,
    });
  }, [overrideBreadcrumbTitles, formDefinition]);

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
