import { ClientAssessmentType } from '@/components/clientDashboard/enrollments/ClientAssessments';
import { ProjectAssessmentType } from '@/modules/projects/components/ProjectAssessments';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { AssessmentFieldsFragment, AssessmentRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export const assessmentPrefix = (role: AssessmentRole) => {
  switch (role) {
    case AssessmentRole.Intake:
      return 'Entry to';
    case AssessmentRole.Exit:
      return 'Exit from';
    case AssessmentRole.Annual:
      return 'Annual for';
    default:
      return 'Assessment for';
  }
};

export const generateAssessmentPath = (
  assessment: AssessmentFieldsFragment,
  clientId: string,
  enrollmentId: string,
  individualViewOnly?: boolean
) => {
  // For Intakes/Exits, link to special routes so they can be viewed in hh context (if multi-member household)
  if (assessment.role === AssessmentRole.Intake && !individualViewOnly) {
    return generateSafePath(EnrollmentDashboardRoutes.INTAKE, {
      clientId,
      enrollmentId,
    });
  }
  if (assessment.role === AssessmentRole.Exit && !individualViewOnly) {
    return generateSafePath(EnrollmentDashboardRoutes.EXIT, {
      clientId,
      enrollmentId,
    });
  }

  // Page for viewing individual assessment in Enrollment Dashboards
  return generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
    clientId,
    enrollmentId,
    assessmentId: assessment.id,
  });
};

export const assessmentRowLinkTo = (
  record: ClientAssessmentType | ProjectAssessmentType,
  clientId?: string
) =>
  // Note: this opens the assessment for individual viewing, even
  // if it's an intake/exit in a multimember household.
  generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
    clientId: clientId,
    enrollmentId: record.enrollment.id,
    assessmentId: record.id,
  });
