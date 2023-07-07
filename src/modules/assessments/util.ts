import {
  EnrollmentFieldsFragment,
  AssessmentRole,
  FormRole,
} from '@/types/gqlTypes';

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

export const assessmentDate = (
  role?: FormRole,
  enrollment?: EnrollmentFieldsFragment
) => {
  if (!enrollment || !role) return;
  switch (role) {
    case FormRole.Intake:
      return enrollment.entryDate;
    case FormRole.Exit:
      return enrollment.exitDate;
    default:
      return;
  }
};
