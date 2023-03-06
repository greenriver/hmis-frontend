import { FormRole, EnrollmentFieldsFragment } from '@/types/gqlTypes';

export const assessmentPrefix = (role: FormRole) => {
  switch (role) {
    case FormRole.Intake:
      return 'Entry to';
    case FormRole.Exit:
      return 'Exit from';
    default:
      return;
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
