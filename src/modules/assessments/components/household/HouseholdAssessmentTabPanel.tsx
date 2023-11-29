import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { memo, useCallback, useEffect, useRef } from 'react';

import IndividualAssessment from '../IndividualAssessment';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import {
  AssessmentStatus,
  HouseholdAssesmentRole,
  TabDefinition,
  tabPanelA11yProps,
} from './util';

import {
  HouseholdAssessmentFormAction,
  HouseholdAssessmentFormState,
} from '@/modules/assessments/components/household/formState';
import { DynamicFormRef } from '@/modules/form/components/DynamicForm';
import { FormActionProps } from '@/modules/form/components/FormActions';
import { FormActionTypes } from '@/modules/form/types';
import { AssessmentFieldsFragment, FormRole } from '@/types/gqlTypes';

interface HouseholdAssessmentTabPanelProps extends TabDefinition {
  active: boolean;
  navigatingAway: boolean;
  role: HouseholdAssesmentRole;
  refetch: () => Promise<any>;
  nextTab?: string;
  previousTab?: string;
  navigateToTab: (t: string) => void;
  updateTabStatus: (status: AssessmentStatus, tabId: string) => void;
  assessmentStatus: AssessmentStatus;
  onFormStateChange: (
    enrollmentId: string,
    action: HouseholdAssessmentFormAction
  ) => void;
  formState: HouseholdAssessmentFormState;
}

// Memoized to only re-render when props change (shallow compare)
const HouseholdAssessmentTabPanel = memo(
  ({
    active,
    navigatingAway,
    id,
    clientName,
    enrollmentId,
    assessmentId,
    client,
    relationshipToHoH,
    role,
    nextTab,
    previousTab,
    navigateToTab,
    refetch,
    updateTabStatus,
    assessmentSubmitted,
    assessmentStatus,
    onFormStateChange,
    formState,
  }: HouseholdAssessmentTabPanelProps) => {
    // console.debug('Rendering assessment panel for', clientName);

    const formRef = useRef<DynamicFormRef>(null);

    // If we navigated AWAY from this tab, do a background save on the form.
    useEffect(() => {
      if (!formRef.current) return;
      if (!navigatingAway) return;
      // skip save if it's already happening
      if (formState.saving) return;
      if (assessmentSubmitted) {
        formRef.current.SubmitIfDirty(true, () => {
          // TODO: Update tab status to 'error' if error?
          // console.debug(`Submitted ${clientName}!`);
          onFormStateChange(enrollmentId, 'saveCompleted');
        });
      } else {
        formRef.current.SaveIfDirty(() => {
          onFormStateChange(enrollmentId, 'saveCompleted');
          // TODO: Update tab status to 'error' if error?
          // console.debug(`Saved ${clientName}!`);
          if (!assessmentId) {
            // This was a NEW assessment; we need to re-fetch to get it
            updateTabStatus(AssessmentStatus.Started, id);
            refetch();
          }
        });
      }
    }, [
      onFormStateChange,
      formState.saving,
      navigatingAway,
      assessmentId,
      assessmentSubmitted,
      enrollmentId,
      id,
      refetch,
      updateTabStatus,
    ]);

    const getFormActionProps = useCallback(
      (assessment?: AssessmentFieldsFragment) => {
        const config: NonNullable<FormActionProps['config']> = [];
        const nextPreviousProps = {
          variant: 'text',
          sx: { height: '50px', alignSelf: 'center' },
        } as const;

        config.push({
          id: 'prev',
          label: 'Previous',
          action: FormActionTypes.Navigate,
          buttonProps: {
            disabled: !previousTab,
            startIcon: <ArrowBackIcon fontSize='small' />,
            ...nextPreviousProps,
          } as const,
          onSuccess: () => {
            if (previousTab) navigateToTab(previousTab);
          },
        });

        if (assessment && !assessment.inProgress) {
          config.push({
            id: 'submit',
            label: 'Save & Submit',
            centerAlign: true,
            action: FormActionTypes.Submit,
            buttonProps: { variant: 'outlined' } as const,
            onSuccess: () => {
              updateTabStatus(AssessmentStatus.Submitted, id);
              refetch();
            },
          });
        } else {
          config.push({
            id: 'save',
            label: 'Save Assessment',
            centerAlign: true,
            action: FormActionTypes.Save,
            buttonProps: { variant: 'contained', size: 'large' } as const,
            onSuccess: () => {
              if (!assessment) updateTabStatus(AssessmentStatus.Started, id);
              refetch();
            },
          });
        }

        config.push({
          id: 'next',
          label: 'Next',
          action: FormActionTypes.Navigate,
          buttonProps: {
            disabled: !nextTab,
            endIcon: <ArrowForwardIcon fontSize='small' />,
            ...nextPreviousProps,
          } as const,
          onSuccess: () => {
            if (nextTab) navigateToTab(nextTab);
          },
        });

        return { config };
      },
      [navigateToTab, previousTab, nextTab, refetch, updateTabStatus, id]
    );

    return (
      <AlwaysMountedTabPanel
        active={active}
        key={id}
        {...tabPanelA11yProps(id)}
      >
        <IndividualAssessment
          clientName={clientName}
          client={client}
          relationshipToHoH={relationshipToHoH}
          embeddedInWorkflow
          enrollmentId={enrollmentId}
          assessmentId={assessmentId}
          assessmentStatus={assessmentStatus}
          formRole={role as unknown as FormRole}
          getFormActionProps={getFormActionProps}
          visible={active}
          formRef={formRef}
          onFormStateChange={onFormStateChange}
        />
      </AlwaysMountedTabPanel>
    );
  }
);

HouseholdAssessmentTabPanel.displayName = 'HouseholdAssessmentTabPanel';

export default HouseholdAssessmentTabPanel;
