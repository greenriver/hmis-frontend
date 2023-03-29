import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { memo, useCallback, useEffect, useRef } from 'react';

import IndividualAssessment from '../IndividualAssessment';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import { AssessmentStatus, TabDefinition, tabPanelA11yProps } from './util';

import usePrevious from '@/hooks/usePrevious';
import { DynamicFormRef } from '@/modules/form/components/DynamicForm';
import { FormActionTypes } from '@/modules/form/types';
import { AssessmentFieldsFragment, FormRole } from '@/types/gqlTypes';

interface HouseholdAssessmentTabPanelProps extends TabDefinition {
  active: boolean;
  formRole: FormRole.Intake | FormRole.Exit;
  refetch: () => Promise<any>;
  nextTab?: string;
  previousTab?: string;
  navigateToTab: (t: string) => void;
  updateTabStatus: (status: AssessmentStatus, tabId: string) => void;
}

// Memoized to only re-render when props change (shallow compare)
const HouseholdAssessmentTabPanel = memo(
  ({
    active,
    id,
    clientName,
    enrollmentId,
    assessmentId,
    client,
    relationshipToHoH,
    formRole,
    nextTab,
    previousTab,
    navigateToTab,
    refetch,
    updateTabStatus,
    assessmentSubmitted,
  }: HouseholdAssessmentTabPanelProps) => {
    // console.debug('Rendering assessment panel for', clientName);

    const wasActive = usePrevious(active);
    const formRef = useRef<DynamicFormRef>(null);

    // If we navigated AWAY from this tab, do a background save on the form.
    useEffect(() => {
      if (!formRef.current) return;
      if (wasActive && !active) {
        if (assessmentSubmitted) {
          formRef.current.SubmitIfDirty(true, () => {
            // TODO: Update tab status to 'error' if error?
            console.debug(`Submitted ${clientName}!`);
          });
        } else {
          formRef.current.SaveIfDirty(() => {
            // TODO: Update tab status to 'error' if error?
            console.debug(`Saved ${clientName}!`);
            if (!assessmentId) {
              // This was a NEW assessment; we need to re-fetch to get it
              updateTabStatus(AssessmentStatus.Started, id);
              refetch();
            }
          });
        }
      }
    });

    const getFormActionProps = useCallback(
      (assessment?: AssessmentFieldsFragment) => {
        const config = [];
        const nextPreviousProps = {
          variant: 'text',
          sx: { height: '50px', alignSelf: 'center' },
        };

        config.push({
          id: 'prev',
          label: 'Previous',
          action: FormActionTypes.Navigate,
          buttonProps: {
            disabled: !previousTab,
            startIcon: <ArrowBackIcon fontSize='small' />,
            ...nextPreviousProps,
          },
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
            buttonProps: { variant: 'outlined' },
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
            buttonProps: { variant: 'contained', size: 'large' },
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
          },
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
          formRole={formRole}
          getFormActionProps={getFormActionProps}
          visible={active}
          lockIfSubmitted
          formRef={formRef}
        />
      </AlwaysMountedTabPanel>
    );
  }
);

HouseholdAssessmentTabPanel.displayName = 'HouseholdAssessmentTabPanel';

export default HouseholdAssessmentTabPanel;
