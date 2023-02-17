import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import { memo, useCallback } from 'react';

import IndividualAssessment from '../IndividualAssessment';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import { AssessmentStatus, TabDefinition } from './types';

import { AssessmentFieldsFragment, AssessmentRole } from '@/types/gqlTypes';

const tabPanelA11yProps = (key: string) => {
  return {
    id: `tabpanel-${key}`,
    'aria-labelledby': `tab-${key}`,
  };
};

interface HouseholdAssessmentTabPanelProps extends TabDefinition {
  active: boolean;
  assessmentRole: AssessmentRole.Intake | AssessmentRole.Exit;
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
    assessmentRole,
    nextTab,
    previousTab,
    navigateToTab,
    refetch,
    updateTabStatus,
    status,
  }: HouseholdAssessmentTabPanelProps) => {
    console.debug('Rendering assessment panel for', clientName);
    const readyToSubmit = status === AssessmentStatus.ReadyToSubmit;

    const getFormActionProps = useCallback(
      (assessment: AssessmentFieldsFragment) => {
        const hasBeenSubmitted = assessment && !assessment.inProgress;

        const config = [];
        config.push({
          id: 'readyToSubmit',
          label: hasBeenSubmitted ? 'Submitted' : 'Ready to Submit',
          action: 'SAVE',
          buttonProps: {
            variant: 'contained',
            disabled: hasBeenSubmitted || readyToSubmit,
            startIcon:
              hasBeenSubmitted || readyToSubmit ? (
                <CheckIcon fontSize='small' />
              ) : null,
          },
          onSuccess: () => {
            updateTabStatus(AssessmentStatus.ReadyToSubmit, id);
            refetch();
          },
        });

        if (!hasBeenSubmitted) {
          config.push({
            id: 'save',
            label: 'Save',
            action: 'SAVE',
            buttonProps: { variant: 'outlined' },
            onSuccess: () => {
              updateTabStatus(AssessmentStatus.Started, id);
              refetch();
            },
          });
        }

        config.push({
          id: 'prev',
          label: hasBeenSubmitted ? 'Previous' : 'Save & Previous',
          action: hasBeenSubmitted ? 'NAVIGATE' : 'SAVE',
          rightAlign: true,
          buttonProps: {
            disabled: !previousTab,
            variant: 'outlined',
            startIcon: <ArrowBackIcon fontSize='small' />,
          },
          onSuccess: () => {
            if (!previousTab) return;
            if (!hasBeenSubmitted) {
              updateTabStatus(AssessmentStatus.Started, id);
              refetch();
            }
            navigateToTab(previousTab);
          },
        });

        config.push({
          id: 'next',
          label: hasBeenSubmitted ? 'Next' : 'Save & Next',
          action: hasBeenSubmitted ? 'NAVIGATE' : 'SAVE',
          rightAlign: true,
          buttonProps: {
            disabled: !nextTab,
            variant: 'outlined',
            endIcon: <ArrowForwardIcon fontSize='small' />,
          },
          onSuccess: () => {
            if (!nextTab) return;
            if (!hasBeenSubmitted) {
              updateTabStatus(AssessmentStatus.Started, id);
              refetch();
            }
            navigateToTab(nextTab);
          },
        });

        return { config };
      },
      [
        navigateToTab,
        previousTab,
        nextTab,
        refetch,
        readyToSubmit,
        updateTabStatus,
        id,
      ]
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
          assessmentRole={assessmentRole}
          getFormActionProps={getFormActionProps}
          lockIfSubmitted
        />
      </AlwaysMountedTabPanel>
    );
  }
);

export default HouseholdAssessmentTabPanel;
