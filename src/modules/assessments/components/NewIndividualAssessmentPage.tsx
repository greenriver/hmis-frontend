import { useEffect } from 'react';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessmentFormController from '@/modules/assessments/components/IndividualAssessmentFormController';
import MissingDefinitionAlert from '@/modules/assessments/components/MissingDefinitionAlert';
import useAssessmentFormDefinition from '@/modules/assessments/hooks/useAssessmentFormDefinition';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { FormStatus } from '@/types/gqlTypes';

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

  // Fetch the FormDefinition by ID
  const { formDefinition, loading } = useAssessmentFormDefinition({
    formDefinitionId,
    projectId: enrollment?.project.id || '',
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
  if (
    ![FormStatus.Published, FormStatus.Retired].includes(formDefinition.status)
  )
    return <NotFound />;

  return (
    <IndividualAssessmentFormController
      enrollment={enrollment}
      client={client}
      viewingDefinition={formDefinition}
      editingDefinition={formDefinition}
    />
  );
};

export default NewIndividualAssessmentPage;
