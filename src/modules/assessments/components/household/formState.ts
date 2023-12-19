export interface HouseholdAssessmentFormState {
  dirty: boolean;
  saving: boolean;
  errors: boolean;
}

export type HouseholdAssessmentFormAction =
  | 'saveStarted'
  | 'saveCompleted'
  | 'saveFailed'
  | 'saveCanceled'
  | 'formDirty';

export const initialHouseholdAssessmentFormState: HouseholdAssessmentFormState =
  {
    dirty: false,
    saving: false,
    errors: false,
  };

export function householdAssessmentFormStateReducer(
  state: HouseholdAssessmentFormState,
  action: HouseholdAssessmentFormAction
): HouseholdAssessmentFormState {
  switch (action) {
    case 'saveStarted':
      return { ...state, saving: true };
    case 'saveCompleted':
      return { saving: false, dirty: false, errors: false };
    case 'saveFailed':
      return { saving: false, dirty: false, errors: true };
    case 'saveCanceled':
      return { saving: false, dirty: true, errors: false };
    case 'formDirty':
      return { ...state, dirty: true, errors: false };
  }
}
