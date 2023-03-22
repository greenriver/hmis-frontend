import { ClientNameDobVeteranFields } from '@/modules/form/util/formUtil';
import { FormRole, RelationshipToHoH } from '@/types/gqlTypes';

export enum AssessmentStatus {
  NotStarted,
  Started,
  ReadyToSubmit,
  Submitted,
  Warning,
  Error,
}

type LocalTabState = {
  status: AssessmentStatus;
};

export type TabDefinition = {
  id: string;
  clientName: string;
  client: ClientNameDobVeteranFields;
  clientId: string;
  enrollmentId: string;
  assessmentId?: string;
  assessmentInProgress?: boolean;
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

const submittedText = {
  [FormRole.Intake]: 'Submitted',
  [FormRole.Exit]: 'Exited',
};

const readyToSubmitText = {
  [FormRole.Intake]: 'Ready to Submit',
  [FormRole.Exit]: 'Ready to Exit',
};

export const labelForStatus = (
  status: AssessmentStatus,
  role: FormRole.Intake | FormRole.Exit
) => {
  switch (status) {
    case AssessmentStatus.NotStarted:
      return 'Not Started';
    case AssessmentStatus.Started:
      return 'In Progress';

    case AssessmentStatus.ReadyToSubmit:
      return readyToSubmitText[role];

    case AssessmentStatus.Submitted:
      return submittedText[role];

    case AssessmentStatus.Warning:
      return 'Warning';

    case AssessmentStatus.Error:
      return 'Error';
  }
};
