import { AssessmentRole, EnrollmentFieldsFragment } from '@/types/gqlTypes';

export const assessmentPrefix = (role: AssessmentRole) => {
  switch (role) {
    case AssessmentRole.Intake:
      return 'Entry to';
    case AssessmentRole.Exit:
      return 'Exit from';
    default:
      return;
  }
};

export const assessmentDate = (
  role?: AssessmentRole,
  enrollment?: EnrollmentFieldsFragment
) => {
  if (!enrollment || !role) return;
  switch (role) {
    case AssessmentRole.Intake:
      return enrollment.entryDate;
    case AssessmentRole.Exit:
      return enrollment.exitDate;
    default:
      return;
  }
};
