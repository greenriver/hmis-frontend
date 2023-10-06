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

import usePrevious from '@/hooks/usePrevious';
import { DynamicFormRef } from '@/modules/form/components/DynamicForm';
import { FormActionProps } from '@/modules/form/components/FormActions';
import { FormActionTypes, LocalConstants } from '@/modules/form/types';
import { AssessmentFieldsFragment, FormRole } from '@/types/gqlTypes';

interface HouseholdAssessmentTabPanelProps extends TabDefinition {
  active: boolean;
  role: HouseholdAssesmentRole;
  onSaveOrSubmit: (assessmentId: string) => void;
  nextTab?: string;
  previousTab?: string;
  navigateToTab: (t: string) => void;
  updateTabStatus: (status: AssessmentStatus, tabId: string) => void;
  assessmentStatus: AssessmentStatus;
  localConstants?: LocalConstants;
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
    role,
    nextTab,
    previousTab,
    navigateToTab,
    onSaveOrSubmit,
    updateTabStatus,
    assessmentSubmitted,
    assessmentStatus,
    localConstants,
  }: HouseholdAssessmentTabPanelProps) => {
    // console.debug('Rendering assessment panel for', clientName, assessmentId);

    const wasActive = usePrevious(active);
    const formRef = useRef<DynamicFormRef>(null);

    // If we navigated AWAY from this tab, do a background save on the form.
    useEffect(() => {
      if (!formRef.current) return;
      if (wasActive && !active) {
        if (assessmentSubmitted) {
          // This is an assessment that has already been submitted, so we re-submit it in the background
          formRef.current.SubmitIfDirty(true, () => {
            // TODO: Update tab status to 'error' if error
            // console.debug(`Submitted ${clientName}!`);
          });
        } else {
          // This is an assessment that has not been submitted, so we save it in the background
          formRef.current.SaveIfDirty((recordId) => {
            // TODO: Update tab status to 'error' if error
            // console.debug(`Saved ${clientName}!`);
            if (!assessmentId) {
              // This was a brand new assessment being saved for the first time; update status
              updateTabStatus(AssessmentStatus.InProgress, recordId);
            }
            onSaveOrSubmit(recordId);
          });
        }
      }
    });

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
            onSuccess: (recordId) => {
              updateTabStatus(AssessmentStatus.Submitted, id);
              onSaveOrSubmit(recordId);
            },
          });
        } else {
          config.push({
            id: 'save',
            label: 'Save Assessment',
            centerAlign: true,
            action: FormActionTypes.Save,
            buttonProps: { variant: 'contained', size: 'large' } as const,
            //FIXME get rid of these things
            onSuccess: (recordId) => {
              if (!assessment) updateTabStatus(AssessmentStatus.InProgress, id);
              onSaveOrSubmit(recordId);
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
      [navigateToTab, previousTab, nextTab, onSaveOrSubmit, updateTabStatus, id]
    );

    return (
      <AlwaysMountedTabPanel
        active={active}
        key={id}
        {...tabPanelA11yProps(id)}
      >
        <IndividualAssessment
          key={assessmentId}
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
          localConstants={localConstants}
        />
      </AlwaysMountedTabPanel>
    );
  }
);

HouseholdAssessmentTabPanel.displayName = 'HouseholdAssessmentTabPanel';

export default HouseholdAssessmentTabPanel;
