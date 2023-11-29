export interface HouseholdAssessmentFormState {
  dirty: boolean;
  saving: boolean;
  // these are hard to track
  // errors: boolean
}

export type HouseholdAssessmentFormAction =
  | 'saveStarted'
  | 'saveCompleted'
  | 'formDirty';

export const initialHouseholdAssessmentFormState: HouseholdAssessmentFormState =
  {
    dirty: false,
    saving: false,
  };

export function householdAssessmentFormStateReducer(
  state: HouseholdAssessmentFormState,
  action: HouseholdAssessmentFormAction
): HouseholdAssessmentFormState {
  // console.info('action', action);
  switch (action) {
    case 'saveStarted':
      return { ...state, saving: true };
    case 'saveCompleted':
      return { ...state, saving: false, dirty: false };
    case 'formDirty':
      return { ...state, dirty: true };
  }
}
