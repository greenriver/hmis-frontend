import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { assign } from 'lodash-es';
import { ReactNode, Ref, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAssessmentHandlers } from '../hooks/useAssessmentHandlers';

import LockedAssessmentAlert from './alerts/LockedAssessmentAlert';
import UnsavedAssessmentAlert from './alerts/UnsavedAssessmentAlert';
import WipAssessmentAlert from './alerts/WipAssessmentAlert';
import DeleteAssessmentButton from './DeleteAssessmentButton';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import useIsPrintView from '@/hooks/useIsPrintView';
import usePrintTrigger from '@/hooks/usePrintTrigger';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import { hasAnyValue } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormProps,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import FormStepper from '@/modules/form/components/FormStepper';
import RecordPickerDialog from '@/modules/form/components/RecordPickerDialog';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { AlwaysPresentLocalConstants } from '@/modules/form/hooks/useInitialFormValues';
import usePreloadPicklists from '@/modules/form/hooks/usePreloadPicklists';
import {
  getInitialValues,
  getItemMap,
  initialValuesFromAssessment,
} from '@/modules/form/util/formUtil';
import { RelatedRecord } from '@/modules/form/util/recordPickerUtil';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  FormDefinition,
  FormRole,
  FullAssessmentFragment,
  InitialBehavior,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  // assessmentTitle: string;
  formRole?: FormRole;
  definition: FormDefinition;
  assessment?: FullAssessmentFragment;
  top?: number;
  navigationTitle: ReactNode;
  embeddedInWorkflow?: boolean;
  FormActionProps?: DynamicFormProps['FormActionProps'];
  locked?: boolean;
  visible?: boolean;
  formRef?: Ref<DynamicFormRef>;
}

const AssessmentForm = ({
  assessment,
  formRole,
  definition,
  navigationTitle,
  enrollment,
  embeddedInWorkflow,
  FormActionProps,
  formRef,
  locked: lockedInitial,
  visible = true,
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
}: Props) => {
  // Whether record picker dialog is open for autofill
  const [dialogOpen, setDialogOpen] = useState(false);

  // Whether assessment is locked
  const [locked, setLocked] = useState(lockedInitial || false);

  // Most recently selected "source" assesment for autofill
  const [sourceAssessment, setSourceAssessment] = useState<
    FullAssessmentFragment | undefined
  >();
  // Trigger for reloading initial values and form if a source assesment is chosen for autofill.
  // This is needed to support re-selecting the same assessment (which should clear and reload the form again)
  const [reloadInitialValues, setReloadInitialValues] = useState(false);

  const onSelectAutofillRecord = useCallback((record: RelatedRecord) => {
    setSourceAssessment(record as unknown as FullAssessmentFragment);
    setDialogOpen(false);
    setReloadInitialValues((old) => !old);
  }, []);

  const isPrintView = useIsPrintView();

  const { submitHandler, saveDraftHandler, mutationLoading, errors } =
    useAssessmentHandlers({
      definition,
      enrollmentId: enrollment.id,
      assessmentId: assessment?.id,
    });

  const itemMap = useMemo(
    () => getItemMap(definition.definition),
    [definition]
  );
  // Set initial values for the assessment. This happens on initial load,
  // and any time the user selects an assessment for autofilling the entire form.
  const initialValues = useMemo(() => {
    if (mutationLoading || !definition || !enrollment) return;
    if (locked && assessment) return {};

    // Local values that may be referenced by the FormDefinition
    const localConstants = {
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
      ...AlwaysPresentLocalConstants,
    };

    const source = sourceAssessment || assessment;

    // Set initial values based solely on FormDefinition
    const init = getInitialValues(definition.definition, localConstants);
    if (source) {
      // Overlay with values from Assessment
      const initFromAssessment = initialValuesFromAssessment(itemMap, source);
      assign(init, initFromAssessment);

      // Overlay initial values that have "OVERWRITE" specification type ("linked" fields)
      const initialsToOverwrite = getInitialValues(
        definition.definition,
        localConstants,
        InitialBehavior.Overwrite
      );
      assign(init, initialsToOverwrite);
    }

    // console.debug(
    //   'Initial Form State',
    //   init,
    //   'from source:',
    //   source?.id || 'none'
    // );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unused = reloadInitialValues; // reference trigger
    return init;
  }, [
    assessment,
    definition,
    mutationLoading,
    enrollment,
    sourceAssessment,
    reloadInitialValues,
    itemMap,
    locked,
  ]);

  const navigate = useNavigate();
  const navigateToEnrollment = useMemo(
    () => () =>
      navigate(
        generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
          clientId: enrollment.client.id,
          enrollmentId: enrollment.id,
        })
      ),
    [enrollment, navigate]
  );

  useScrollToHash(!enrollment || mutationLoading, top);

  const canEdit = enrollment?.access.canEditEnrollments;

  const pickListArgs = useMemo(
    () => ({ projectId: enrollment?.project.id }),
    [enrollment]
  );

  // Manually preload picklists here so we can prevent printing until they're fetched
  const { loading: pickListsLoading } = usePreloadPicklists({
    definition: definition.definition,
    pickListArgs,
  });
  usePrintTrigger({
    startReady: isPrintView,
    hold: pickListsLoading,
  });

  const navigation = (
    <Grid item xs={2.5} sx={{ pr: 2, pt: '0 !important' }}>
      <Box
        sx={{
          position: 'sticky',
          top: top + 16,
        }}
      >
        <Paper sx={{ p: 2 }}>
          {navigationTitle}
          <FormStepper
            items={definition.definition.item}
            scrollOffset={top}
            useUrlHash={!embeddedInWorkflow}
          />
        </Paper>
        <Stack gap={2} sx={{ mt: 2 }}>
          {!assessment && (
            <ButtonTooltipContainer title='Choose a previous assessment to copy into this assessment'>
              <Button
                variant='outlined'
                onClick={() => setDialogOpen(true)}
                sx={{ height: 'fit-content' }}
                fullWidth
              >
                Autofill Assessment
              </Button>
            </ButtonTooltipContainer>
          )}
          {assessment && (
            <DeleteAssessmentButton
              assessment={assessment}
              clientId={enrollment.client.id}
              enrollmentId={enrollment.id}
              onSuccess={navigateToEnrollment}
            />
          )}
          {import.meta.env.MODE === 'development' && assessment && (
            <IdDisplay prefix='Assessment' value={assessment.id} />
          )}
        </Stack>
      </Box>
    </Grid>
  );

  return (
    <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
      {!isPrintView && navigation}
      <Grid item xs sx={{ pt: '0 !important' }}>
        {!isPrintView && assessment && !assessment.inProgress && locked && (
          <LockedAssessmentAlert
            allowUnlock={canEdit}
            onUnlock={() => setLocked(false)}
          />
        )}
        {assessment && assessment.inProgress && <WipAssessmentAlert />}
        {embeddedInWorkflow && !assessment && <UnsavedAssessmentAlert />}
        {locked && assessment ? (
          <DynamicView
            // dont use `initialValues` because we don't want the OVERWRITE fields
            values={initialValuesFromAssessment(itemMap, assessment)}
            definition={definition.definition}
            pickListArgs={pickListArgs}
          />
        ) : (
          <DynamicForm
            // Remount component if a source assessment has been selected
            key={`${assessment?.id}-${sourceAssessment?.id}-${reloadInitialValues}`}
            definition={definition.definition}
            ref={formRef}
            onSubmit={submitHandler}
            onSaveDraft={
              assessment && !assessment.inProgress
                ? undefined
                : saveDraftHandler
            }
            initialValues={initialValues || undefined}
            pickListArgs={pickListArgs}
            loading={mutationLoading}
            errors={errors}
            locked={locked}
            visible={visible}
            showSavePrompt
            alwaysShowSaveSlide={!!embeddedInWorkflow}
            FormActionProps={FormActionProps}
            // Only show "warn if empty" treatments if this is an existing assessment,
            // OR if the user has attempted to submit this (new) assessment
            warnIfEmpty={!!assessment || hasAnyValue(errors)}
          />
        )}
      </Grid>

      {/* Dialog for selecting autofill record */}
      {definition && (
        <RecordPickerDialog
          id='assessmentPickerDialog'
          recordType='Assessment'
          open={dialogOpen}
          role={formRole}
          onSelected={onSelectAutofillRecord}
          onCancel={() => setDialogOpen(false)}
          description={
            // <Alert severity='info' icon={false} sx={{ mb: 2 }}>
            <Typography variant='body2' sx={{ mb: 2 }}>
              Select a previous assessment to populate the current assessment.
              Any changes you have made will be overwritten.
            </Typography>
            // </Alert>
          }
        />
      )}
    </Grid>
  );
};

export default AssessmentForm;
