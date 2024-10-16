import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '@/components/elements/Loading';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import HouseholdAssessments from '@/modules/assessments/components/household/HouseholdAssessments';
import MissingDefinitionAlert from '@/modules/assessments/components/MissingDefinitionAlert';
import useAssessmentFormDefinition from '@/modules/assessments/hooks/useAssessmentFormDefinition';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const IntakeAssessmentPage = () => {
  const { enrollment, enrollmentLoading, client } =
    useEnrollmentDashboardContext();
  const navigate = useNavigate();

  const { formDefinition, loading: definitionLoading } =
    useAssessmentFormDefinition({
      role: AssessmentRole.Intake,
      projectId: enrollment?.project.id || '',
      // apply form rules based on the entry date. if this enrollment is from a year ago and the project was funded by PATH at that time, we want to see PATH questions.
      assessmentDate: enrollment?.entryDate,
    });

  useEffect(() => {
    if (enrollmentLoading) return; // if enrollment is reloading, dont do anything yet
    if (!enrollment || !formDefinition) return;
    if (enrollment.householdSize > 1) return; // render in-place

    // Navigate away for single-member HH with existing Intake Assessment
    if (enrollment.intakeAssessment) {
      navigate(
        generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
          enrollmentId: enrollment.id,
          clientId: client.id,
          assessmentId: enrollment.intakeAssessment.id,
        }),
        { replace: true }
      );
    } else {
      // Navigate away for single-member HH with no Intake Assessment
      navigate(
        generateSafePath(EnrollmentDashboardRoutes.NEW_ASSESSMENT, {
          enrollmentId: enrollment.id,
          clientId: client.id,
          formDefinitionId: formDefinition.id,
        }),
        { replace: true }
      );
    }
  }, [client, enrollment, enrollmentLoading, formDefinition, navigate]);

  if (!formDefinition && definitionLoading) return <Loading />;
  if (!formDefinition) return <MissingDefinitionAlert />;
  if (!enrollment) return <NotFound />;

  // Househould has multiple members
  if (enrollment.householdSize > 1) {
    return (
      <HouseholdAssessments
        role={AssessmentRole.Intake}
        enrollment={enrollment}
        formDefinition={formDefinition}
      />
    );
  }

  return null;
};

export default IntakeAssessmentPage;
