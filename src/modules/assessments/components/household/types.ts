import { ClientNameDobVeteranFields } from '@/modules/form/util/formUtil';
import { RelationshipToHoH } from '@/types/gqlTypes';

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
  enrollmentId: string;
  assessmentId?: string;
  assessmentInProgress?: boolean;
  isHoh: boolean;
  relationshipToHoH: RelationshipToHoH;
} & LocalTabState;
