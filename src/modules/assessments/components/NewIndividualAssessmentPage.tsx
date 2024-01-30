import { useEffect } from 'react';
import Loading from '@/components/elements/Loading';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessmentFormController from '@/modules/assessments/components/IndividualAssessmentFormController';
import MissingDefinitionAlert from '@/modules/assessments/components/MissingDefinitionAlert';
import useAssessmentFormDefinition from '@/modules/assessments/hooks/useAssessmentFormDefinition';
import { EnrollmentDashboardRoutes } from '@/routes/routes';

/**
 * Renders a blank assessment for an individual.
 */
const NewIndividualAssessmentPage = () => {
  const { formDefinitionId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    formDefinitionId?: string;
  };

  const { enrollment, client, overrideBreadcrumbTitles } =
    useEnrollmentDashboardContext();

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
    <IndividualAssessmentFormController
      enrollment={enrollment}
      client={client}
      definition={formDefinition}
    />
  );
};

export default NewIndividualAssessmentPage;