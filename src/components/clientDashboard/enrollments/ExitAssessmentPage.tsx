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

const ExitAssessmentPage = () => {
  const { enrollment, client } = useEnrollmentDashboardContext();
  const navigate = useNavigate();

  const { formDefinition, loading } = useAssessmentFormDefinition({
    role: AssessmentRole.Exit,
    projectId: enrollment?.project.id || '',
    // apply form rules based on the exit date. if this enrollment exited a year ago and the project was funded by PATH at that time, we want to see PATH questions.
    assessmentDate: enrollment?.exitDate,
  });

  useEffect(() => {
    if (!enrollment || !formDefinition) return;
    if (enrollment.householdSize > 1) return; // render in-place

    // Navigate away for single-member HH with existing Exit Assessment
    if (enrollment.exitAssessment) {
      navigate(
        generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
          enrollmentId: enrollment.id,
          clientId: client.id,
          assessmentId: enrollment.exitAssessment.id,
        })
      );
    } else {
      // Navigate away for single-member HH with no Exit Assessment
      navigate(
        generateSafePath(EnrollmentDashboardRoutes.NEW_ASSESSMENT, {
          enrollmentId: enrollment.id,
          clientId: client.id,
          formDefinitionId: formDefinition.id,
        })
      );
    }
  }, [client, enrollment, formDefinition, navigate]);

  if (!enrollment) return <NotFound />;
  if (!formDefinition && loading) return <Loading />;
  if (!formDefinition) return <MissingDefinitionAlert />;

  // Househould has multiple members
  if (enrollment.householdSize > 1) {
    return (
      <HouseholdAssessments
        role={AssessmentRole.Exit}
        enrollment={enrollment}
        formDefinition={formDefinition}
      />
    );
  }

  return <NotFound />;
};

export default ExitAssessmentPage;
