import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { useAssessment } from '../../hooks/useAssessment';
import {
  AssessmentResponseStatus,
  useAssessmentHandlers,
} from '../../hooks/useAssessmentHandlers';
import IndividualAssessment from '../IndividualAssessment';

import MissingDefinitionAlert from '../MissingDefinitionAlert';
import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import { AssessmentStatus, TabDefinition, tabPanelA11yProps } from './util';

import Loading from '@/components/elements/Loading';
import {
  HouseholdAssessmentFormAction,
  HouseholdAssessmentFormState,
} from '@/modules/assessments/components/household/formState';
import { DynamicFormRef } from '@/modules/form/components/DynamicForm';
import { FormActionProps } from '@/modules/form/components/FormActions';
import { FormActionTypes } from '@/modules/form/types';
import { FormDefinitionFieldsFragment } from '@/types/gqlTypes';

interface HouseholdAssessmentTabPanelProps extends TabDefinition {
  active: boolean;
  navigatingAway: boolean;
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
  formDefinition: FormDefinitionFieldsFragment;
}

// Memoized to only re-render when props change (shallow compare)
const HouseholdAssessmentTabPanel = memo(
  ({
    active,
    navigatingAway,
    id,
    // clientName,
    enrollmentId,
    assessmentId,
    client,
    nextTab,
    previousTab,
    navigateToTab,
    refetch,
    updateTabStatus,
    assessmentSubmitted,
    onFormStateChange,
    formState,
    formDefinition: mainFormDefinition,
  }: HouseholdAssessmentTabPanelProps) => {
    // if (active) console.debug(clientName, formState);

    const formRef = useRef<DynamicFormRef>(null);

    // If we navigated AWAY from this tab, do a background save on the form.
    useEffect(() => {
      if (!formRef.current) return;
      if (!navigatingAway) return;
      // skip save if it's already happening
      if (formState.saving) return;
      // skip save if there are errors. user must do an explicit save to resolve error before proceeding
      if (formState.errors) return;

      // perform background save or submit
      if (assessmentSubmitted) {
        formRef.current.SubmitIfDirty(false);
      } else {
        formRef.current.SaveIfDirty();
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
      formState.errors,
    ]);

    const { assessment, loading: assessmentLoading } =
      useAssessment(assessmentId);

    const [viewingDefinition, editingDefinition] = useMemo(() => {
      if (assessmentId && !assessment) return [];

      // If we are loading an existing Assessment, always prefer to use
      // the FormDefinition that was resolved on the Assessment. This could
      // be important if it's an older WIP assessment that was saved using a certain
      // form. (It should be re-opened using the same form).
      if (assessment) {
        return [
          assessment.definition,
          assessment.upgradedDefinitionForEditing || assessment.definition,
        ];
      }

      return [mainFormDefinition, mainFormDefinition];
    }, [assessment, assessmentId, mainFormDefinition]);

    const onCompletedMutation = useCallback(
      (status: AssessmentResponseStatus) => {
        // console.debug('Completed with status', status);
        if (['saved', 'submitted'].includes(status)) {
          onFormStateChange?.(enrollmentId, 'saveCompleted');
        } else if (['warning', 'error'].includes(status)) {
          // Treat warning and errors the same right now. This should be expanded to treat them differently with visual indicators.
          onFormStateChange?.(enrollmentId, 'saveFailed');
        }

        // If this was a brand new assessment being saved for the first time,
        // we need to refetch to get it.
        if (status === 'saved' && !assessmentId) {
          updateTabStatus(AssessmentStatus.Started, id);
          refetch();
        }
      },
      [
        assessmentId,
        enrollmentId,
        id,
        onFormStateChange,
        refetch,
        updateTabStatus,
      ]
    );

    const { submitHandler, saveDraftHandler, mutationLoading, errors } =
      useAssessmentHandlers({
        definition: editingDefinition,
        enrollmentId,
        assessmentId,
        assessmentLockVersion: assessment?.lockVersion,
        onCompletedMutation,
      });

    // disabling nav buttons while loading, and if there are errors
    const disableNavigation = mutationLoading || formState.errors;

    const FormActionProps = useMemo(() => {
      const config: NonNullable<FormActionProps['config']> = [];
      const navTooltip = formState.errors
        ? 'Please fix errors and save changes before proceeding.'
        : undefined;

      config.push({
        id: 'prev',
        label: 'Previous Client',
        action: FormActionTypes.Navigate,
        buttonProps: {
          disabled: disableNavigation,
          startIcon: <ArrowBackIcon fontSize='small' />,
          variant: 'text',
          sx: {
            display: !previousTab ? 'none' : undefined,
            height: '50px',
            alignSelf: 'center',
          },
        } as const,
        tooltip: navTooltip,
        onClick: () => {
          if (previousTab) navigateToTab(previousTab);
        },
      });

      if (assessment && !assessment.inProgress) {
        config.push({
          id: 'submit',
          label: 'Save & Submit',
          loadingLabel: 'Submitting',
          centerAlign: true,
          action: FormActionTypes.Submit,
          buttonProps: { variant: 'contained', size: 'large' } as const,
        });
      } else {
        config.push({
          id: 'save',
          label: 'Save Assessment',
          loadingLabel: 'Saving',
          centerAlign: true,
          action: FormActionTypes.Save,
          buttonProps: { variant: 'contained', size: 'large' } as const,
        });
      }

      config.push({
        id: 'next',
        label: 'Next Client',
        action: FormActionTypes.Navigate,
        buttonProps: {
          disabled: !nextTab || disableNavigation,
          endIcon: <ArrowForwardIcon fontSize='small' />,
          variant: 'text',
          sx: {
            display: !nextTab ? 'none' : undefined,
            height: '50px',
            alignSelf: 'center',
          },
        } as const,
        tooltip: navTooltip,
        onClick: () => {
          if (nextTab) navigateToTab(nextTab);
        },
      });

      return { config };
    }, [
      previousTab,
      disableNavigation,
      assessment,
      nextTab,
      formState.errors,
      navigateToTab,
    ]);

    useEffect(() => {
      if (mutationLoading) {
        onFormStateChange?.(enrollmentId, 'saveStarted');
      }
    }, [enrollmentId, mutationLoading, onFormStateChange]);

    return (
      <AlwaysMountedTabPanel
        active={active}
        key={id}
        {...tabPanelA11yProps(id)}
      >
        {assessmentLoading ? (
          <Loading />
        ) : !viewingDefinition || !editingDefinition ? (
          <MissingDefinitionAlert />
        ) : (
          <IndividualAssessment
            viewingDefinition={viewingDefinition}
            editingDefinition={editingDefinition}
            client={client}
            embeddedInWorkflow
            enrollmentId={enrollmentId}
            assessment={assessment}
            FormActionProps={FormActionProps}
            visible={active}
            formRef={formRef}
            onFormStateChange={onFormStateChange}
            onSubmit={submitHandler}
            onSaveDraft={saveDraftHandler}
            errors={errors}
            mutationLoading={mutationLoading}
            onCancelValidations={() =>
              onFormStateChange?.(enrollmentId, 'saveCanceled')
            }
          />
        )}
      </AlwaysMountedTabPanel>
    );
  }
);

HouseholdAssessmentTabPanel.displayName = 'HouseholdAssessmentTabPanel';

export default HouseholdAssessmentTabPanel;
