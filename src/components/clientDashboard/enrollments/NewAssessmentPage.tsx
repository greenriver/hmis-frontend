import { showAssessmentInHousehold } from './AssessmentPage';
import Loading from '@/components/elements/Loading';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useIsPrintView from '@/hooks/useIsPrintView';
import useSafeParams from '@/hooks/useSafeParams';
import HouseholdAssessments from '@/modules/assessments/components/household/HouseholdAssessments';
import { isHouseholdAssesmentRole } from '@/modules/assessments/components/household/util';
import IndividualAssessmentPage from '@/modules/assessments/components/IndividualAssessmentPage';
import MissingDefinitionAlert from '@/modules/assessments/components/MissingDefinitionAlert';
import useFormDefinition from '@/modules/form/hooks/useFormDefinition';
import { FormRole } from '@/types/gqlTypes';

/**
 * Renders a blank assessment page, for an individual or a household.
 */
const NewAssessmentPage = () => {
  const { enrollment, client } = useEnrollmentDashboardContext();
  const { formRole, formDefinitionId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    formRole: FormRole;
    formDefinitionId?: string;
  };

  const isPrintView = useIsPrintView();
  const renderHouseholdView =
    showAssessmentInHousehold(enrollment, formRole) && !isPrintView;

  // Load the FormDefinition.
  // We may or may not have a specific ID for this form definition. If we don't
  // have the ID, we look it up by role.
  const { formDefinition, loading } = useFormDefinition({
    formDefinitionId,
    queryVariables: {
      role: formRole,
      enrollmentId: enrollment?.id,
      projectId: enrollment?.project?.id,
    },
    client,
    relationshipToHoH: enrollment?.relationshipToHoH,
    skip: renderHouseholdView, // skip for household view, it handles fetching separately
  });

  if (!enrollment) return <NotFound />;
  if (!formRole) return <NotFound />;
  if (loading && !formDefinition) return <Loading />;

  // If household has 2+ members and this is a household assessment, render household workflow
  if (renderHouseholdView && isHouseholdAssesmentRole(formRole)) {
    return <HouseholdAssessments role={formRole} enrollment={enrollment} />;
  }

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
