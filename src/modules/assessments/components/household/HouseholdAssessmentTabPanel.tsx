import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { memo, useCallback } from 'react';

import IndividualAssessment from '../IndividualAssessment';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import { AssessmentStatus, TabDefinition, tabPanelA11yProps } from './util';

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
  }: HouseholdAssessmentTabPanelProps) => {
    console.debug('Rendering assessment panel for', clientName);

    const getFormActionProps = useCallback(
      (assessment?: AssessmentFieldsFragment) => {
        const hasBeenSubmitted = assessment && !assessment.inProgress;

        const config = [];

        const nextPreviousProps = {
          variant: 'text',
          sx: { height: '50px', alignSelf: 'center' },
        };

        config.push({
          id: 'prev',
          label: hasBeenSubmitted ? 'Previous' : 'Save & Previous',
          action: hasBeenSubmitted
            ? FormActionTypes.Navigate
            : FormActionTypes.Save,
          buttonProps: {
            disabled: !previousTab,
            startIcon: <ArrowBackIcon fontSize='small' />,
            ...nextPreviousProps,
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

        if (hasBeenSubmitted) {
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
              updateTabStatus(AssessmentStatus.Started, id);
              refetch();
            },
          });
        }

        config.push({
          id: 'next',
          label: hasBeenSubmitted ? 'Next' : 'Save & Next',
          action: hasBeenSubmitted
            ? FormActionTypes.Navigate
            : FormActionTypes.Save,
          buttonProps: {
            disabled: !nextTab,
            endIcon: <ArrowForwardIcon fontSize='small' />,
            ...nextPreviousProps,
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
        />
      </AlwaysMountedTabPanel>
    );
  }
);

HouseholdAssessmentTabPanel.displayName = 'HouseholdAssessmentTabPanel';

export default HouseholdAssessmentTabPanel;
