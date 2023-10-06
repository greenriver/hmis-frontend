import { ClientNameDobVeteranFields } from '@/modules/form/util/formUtil';
import { AssessmentRole, FormRole, RelationshipToHoH } from '@/types/gqlTypes';

export enum AssessmentStatus {
  NotStarted, // assessment has not been saved yet
  InProgress, // assessment has been saved but not submitted
  Submitted, // assessment has been submitted
  Warning,
  Error,
}

type LocalTabState = {
  status: AssessmentStatus;
};

export type HouseholdAssesmentRole =
  | AssessmentRole.Intake
  | AssessmentRole.Annual
  | AssessmentRole.Exit;

export function isHouseholdAssesmentRole(
  keyInput: AssessmentRole | FormRole | string
): keyInput is HouseholdAssesmentRole {
  return [
    AssessmentRole.Intake,
    AssessmentRole.Annual,
    AssessmentRole.Exit,
  ].includes(keyInput as AssessmentRole);
}

export type TabDefinition = {
  id: string;
  clientName: string;
  client: ClientNameDobVeteranFields;
  clientId: string;
  enrollmentId: string;
  entryOrExitCompleted?: boolean;
  entryDate: string;
  exitDate?: string;
  enrollmentInProgress: boolean;
  assessmentId?: string;
  assessmentLockVersion?: number;
  assessmentInProgress?: boolean;
  assessmentSubmitted: boolean;
  assessmentDate?: string;
  isHoh: boolean;
  relationshipToHoH: RelationshipToHoH;
} & LocalTabState;

export const SUMMARY_TAB_ID = 'summary';
export const tabA11yProps = (key: string) => {
  return {
    id: `tab-${key}`,
    'aria-controls': `tabpanel-${key}`,
  };
};

export const tabPanelA11yProps = (key: string) => {
  return {
    id: `tabpanel-${key}`,
    'aria-labelledby': `tab-${key}`,
  };
};

export const householdAssesmentTitle = (role: HouseholdAssesmentRole) => {
  switch (role) {
    case AssessmentRole.Intake:
      return 'Household Intake';
    case AssessmentRole.Exit:
      return 'Household Exit';
    case AssessmentRole.Annual:
      return 'Household Annual';
  }
};

export const useAssessmentStatus = ({
  assessmentId,
  assessmentInProgress,
}: {
  assessmentId?: string;
  assessmentInProgress?: boolean;
}): AssessmentStatus => {
  const submitted = !!assessmentId && assessmentInProgress;
  return submitted
    ? AssessmentStatus.Submitted
    : assessmentId
    ? AssessmentStatus.InProgress
    : AssessmentStatus.NotStarted;
};
