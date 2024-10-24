import UnlockIcon from '@mui/icons-material/Lock';
import { Grid, Stack, Typography } from '@mui/material';
import { assign } from 'lodash-es';
import {
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { AssessmentLocalConstants } from '../util';
import AssessmentAlert from './alerts/AssessmentAlert';

import AssessmentTitle from './AssessmentTitle';
import FormContainer from '@/components/layout/FormContainer';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { useIsMobile } from '@/hooks/useIsMobile';
import useIsPrintView from '@/hooks/useIsPrintView';
import usePrintTrigger from '@/hooks/usePrintTrigger';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import AssessmentAutofillButton from '@/modules/assessments/components/AssessmentAutofillButton';
import AssessmentFormSideBar from '@/modules/assessments/components/AssessmentFormSideBar';
import AssessmentHistoryInfo from '@/modules/assessments/components/AssessmentHistory';
import { HouseholdAssessmentFormAction } from '@/modules/assessments/components/household/formState';

import { ErrorState, hasAnyValue } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormProps,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import FormActions from '@/modules/form/components/FormActions';
import RecordPickerDialog from '@/modules/form/components/RecordPickerDialog';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import usePreloadPicklists from '@/modules/form/hooks/usePreloadPicklists';
import { AssessmentForPopulation, FormActionTypes } from '@/modules/form/types';
import {
  AlwaysPresentLocalConstants,
  applyDefinitionRulesForClient,
  createInitialValuesFromRecord,
  getInitialValues,
  getItemMap,
  initialValuesFromAssessment,
} from '@/modules/form/util/formUtil';
import {
  age,
  clientBriefName,
  clientNameAllParts,
  raceEthnicityDisplayString,
} from '@/modules/hmis/hmisUtil';
import {
  AssessedClientFieldsFragment,
  EnrollmentFieldsFragment,
  FormDefinitionFieldsFragment,
  FormRole,
  FullAssessmentFragment,
  InitialBehavior,
} from '@/types/gqlTypes';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  client: AssessedClientFieldsFragment;
  // FormDefiniton to use for rendering the assessment in read-only mode
  viewingDefinition: FormDefinitionFieldsFragment;
  // FormDefiniton to use for rendering the assessment for editing
  editingDefinition: FormDefinitionFieldsFragment;
  assessment?: FullAssessmentFragment;
  alerts?: ReactNode;
  top?: number;
  embeddedInWorkflow?: boolean;
  FormActionProps?: DynamicFormProps['FormActionProps'];
  onSubmit: DynamicFormProps['onSubmit'];
  onSaveDraft?: DynamicFormProps['onSaveDraft'];
  errors: ErrorState;
  onCancelValidations?: VoidFunction;
  mutationLoading?: boolean;
  visible?: boolean;
  formRef?: Ref<DynamicFormRef>;
  onFormStateChange?: (
    enrollmentId: string,
    value: HouseholdAssessmentFormAction
  ) => void;
}

const AssessmentForm: React.FC<Props> = ({
  assessment,
  client,
  alerts,
  viewingDefinition,
  editingDefinition,
  enrollment,
  embeddedInWorkflow,
  FormActionProps,
  formRef,
  visible = true,
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
  onFormStateChange,
  onSubmit,
  onSaveDraft,
  errors,
  mutationLoading,
  onCancelValidations,
}) => {
  // Whether record picker dialog is open for autofill
  const [dialogOpen, setDialogOpen] = useState(false);

  // Whether assessment is locked. By default, submitted assessments are locked.
  const canEdit = enrollment?.access.canEditEnrollments;
  const [locked, setLocked] = useState(
    !canEdit || !!(assessment && !assessment.inProgress)
  );
  const handleUnlock = useCallback(() => setLocked(false), []);

  useEffect(() => {
    if (!canEdit) return;
    if (assessment && !assessment.inProgress) setLocked(true);
  }, [assessment, canEdit]); // re-runs after assessment is refetched, which leads to assessment re-locking after submit

  // Choose the FormDefiniton to use for rendering, and filter it down based on client attributes (Data Collected About rules).
  const definition = useMemo(() => {
    const fd = locked ? viewingDefinition : editingDefinition;
    // Apply "data collected about" rules to filter down the definition to relevant items
    const relationshipToHoH = enrollment.relationshipToHoH;
    return applyDefinitionRulesForClient(fd, client, relationshipToHoH);
  }, [
    locked,
    viewingDefinition,
    editingDefinition,
    enrollment.relationshipToHoH,
    client,
  ]);

  // Most recently selected "source" assessment for autofill
  const [sourceAssessment, setSourceAssessment] = useState<
    FullAssessmentFragment | AssessmentForPopulation | undefined
  >();
  // Trigger for reloading initial values and form if a source assessment is chosen for autofill.
  // This is needed to support re-selecting the same assessment (which should clear and reload the form again)
  const [reloadInitialValues, setReloadInitialValues] = useState(false);

  const onSelectAutofillRecord = useCallback(
    (record: AssessmentForPopulation) => {
      setSourceAssessment(record);
      setDialogOpen(false);
      setReloadInitialValues((old) => !old);
    },
    []
  );

  const isPrintView = useIsPrintView();
  const isMobile = useIsMobile();

  const handleDirty = useCallback(
    (dirty: boolean) => {
      // we can only rely on dirty === true
      if (dirty) onFormStateChange?.(enrollment.id, 'formDirty');
    },
    [onFormStateChange, enrollment.id]
  );

  const itemMap = useMemo(
    () => getItemMap(definition.definition),
    [definition]
  );

  // Local values that may be referenced by the FormDefinition
  const localConstants: AssessmentLocalConstants = useMemo(
    () => ({
      entryDate: enrollment.entryDate || undefined,
      exitDate: enrollment.exitDate || undefined,
      projectName: enrollment.project.projectName || undefined,
      clientName: clientNameAllParts(client),
      clientDob: client.dob || undefined,
      clientSsn: client.ssn || undefined,
      clientAge: age(client),
      clientRaceEthnicity: raceEthnicityDisplayString(client.race),
      ...AlwaysPresentLocalConstants,
    }),
    [enrollment, client]
  );

  // Set initial values for the assessment. This happens on initial load,
  // and any time the user selects an assessment for autofilling the entire form.
  const initialValues = useMemo(() => {
    if (!definition || !enrollment) return;
    if (locked && assessment) return {};

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
    } else {
      // If this is a completely new assessment, set initials from Enrollment
      const initialsFromEnrollment = createInitialValuesFromRecord(itemMap, {
        enrollment,
      });
      assign(init, initialsFromEnrollment);
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
    enrollment,
    sourceAssessment,
    reloadInitialValues,
    itemMap,
    locked,
    localConstants,
  ]);

  useScrollToHash(!enrollment || mutationLoading, top);

  const pickListArgs = useMemo(
    () => ({ projectId: enrollment?.project.id }),
    [enrollment]
  );

  // Manually preload picklists here so we can prevent printing until they're fetched
  const { loading: pickListsLoading } = usePreloadPicklists({
    definition: definition.definition,
    pickListArgs,
    skip: !isPrintView,
  });

  usePrintTrigger({
    startReady: isPrintView,
    hold: pickListsLoading,
  });

  const formActionsPropsWithLastUpdated = useMemo<
    typeof FormActionProps
  >(() => {
    const formActionProps: typeof FormActionProps = { ...FormActionProps };
    // Add last saved / last submitted dates
    if (assessment?.inProgress) {
      formActionProps.lastSaved = assessment?.dateUpdated || undefined;
    } else if (assessment && !assessment.inProgress) {
      formActionProps.lastSubmitted = assessment?.dateUpdated || undefined;
    }
    return formActionProps;
  }, [FormActionProps, assessment]);

  // the form is locked, replace the submit button with an 'unlock' button
  const formActionPropsWithLock = useMemo<typeof FormActionProps>(() => {
    const formActionProps: typeof FormActionProps = {
      ...formActionsPropsWithLastUpdated,
    };

    if (!locked || !canEdit) return formActionProps;

    // Add config option for unlocking assessment
    const config = (formActionProps.config?.slice() || [])
      .map((item) => {
        if (item.action !== FormActionTypes.Submit) return item;
        return {
          action: FormActionTypes.Unlock,
          id: 'unlock',
          label: 'Unlock Assessment',
          centerAlign: embeddedInWorkflow,
          buttonProps: {
            onClick: handleUnlock,
            startIcon: <UnlockIcon />,
            size: 'large',
            color: 'inherit',
          } as const,
        };
      })
      .filter((item) => item.action !== FormActionTypes.Discard);
    return { ...formActionProps, config };
  }, [
    formActionsPropsWithLastUpdated,
    locked,
    canEdit,
    embeddedInWorkflow,
    handleUnlock,
  ]);

  const isCustomAssessment = definition.role === FormRole.CustomAssessment;
  const showAutofill = !isCustomAssessment && !assessment && canEdit;

  const titleNode = (
    <AssessmentTitle
      assessmentTitle={definition.title}
      clientName={clientBriefName(client)}
      clientId={client.id}
      projectName={enrollment.project.projectName}
      enrollmentId={enrollment.id}
      entryDate={enrollment.entryDate}
      exitDate={enrollment.exitDate}
    />
  );

  const navigation = (
    <Grid item xs={2.5} sx={{ pr: 2, pt: '0 !important' }}>
      <AssessmentFormSideBar
        enrollment={enrollment}
        definition={definition}
        assessment={assessment}
        isPrintView={isPrintView}
        locked={locked}
        embeddedInWorkflow={embeddedInWorkflow}
        showAutofill={showAutofill}
        onAutofill={() => setDialogOpen(true)}
        top={top}
      />
    </Grid>
  );

  const showNavigation = !isPrintView && !isMobile;

  return (
    <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
      {showNavigation && navigation}
      <Grid item xs={showNavigation ? 9.5 : 12} sx={{ pt: '0 !important' }}>
        <Stack sx={{ mb: 1 }} gap={1}>
          {titleNode}
          {locked && (
            <Stack gap={0.5}>
              <AssessmentHistoryInfo
                label='Created by:'
                user={assessment?.createdBy}
                date={assessment?.dateCreated}
              />
              <AssessmentHistoryInfo
                label='Last Edited by:'
                user={assessment?.user}
                date={assessment?.dateUpdated}
              />
            </Stack>
          )}
        </Stack>
        {alerts}
        {!isPrintView && (
          <AssessmentAlert
            assessment={assessment}
            locked={locked}
            allowUnlock={canEdit && !embeddedInWorkflow}
            onUnlock={handleUnlock}
          />
        )}
        {showAutofill && !showNavigation && (
          <AssessmentAutofillButton
            sx={{ mb: 2 }}
            onClick={() => setDialogOpen(true)}
          />
        )}
        {locked && assessment ? (
          <FormContainer
            actions={
              canEdit && !isPrintView ? (
                <FormActions
                  onSubmit={() => undefined}
                  onSaveDraft={() => undefined}
                  disabled={false}
                  loading={false}
                  {...formActionPropsWithLock}
                />
              ) : undefined
            }
            sticky={embeddedInWorkflow ? 'always' : 'auto'}
          >
            <DynamicView
              // don't use `initialValues` because we don't want the OVERWRITE fields
              values={initialValuesFromAssessment(itemMap, assessment)}
              definition={definition.definition}
              pickListArgs={pickListArgs}
              localConstants={localConstants}
            />
          </FormContainer>
        ) : (
          <DynamicForm
            // Remount component if a source assessment has been selected
            key={`${assessment?.id}-${sourceAssessment?.id}-${reloadInitialValues}`}
            definition={definition.definition}
            ref={formRef}
            onSubmit={onSubmit}
            onSaveDraft={
              assessment && !assessment.inProgress ? undefined : onSaveDraft
            }
            localConstants={localConstants}
            initialValues={initialValues || undefined}
            pickListArgs={pickListArgs}
            loading={mutationLoading}
            errors={errors}
            locked={locked}
            visible={visible}
            clientId={client.id}
            showSavePrompt
            alwaysShowSaveSlide={!!embeddedInWorkflow}
            FormActionProps={formActionsPropsWithLastUpdated}
            onDirty={handleDirty}
            ValidationDialogProps={{ onCancel: onCancelValidations }}
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
          clientId={client.id}
          open={dialogOpen}
          role={definition.role}
          onSelected={onSelectAutofillRecord}
          onCancel={() => setDialogOpen(false)}
          description={
            <Typography variant='body2' sx={{ my: 2 }}>
              Select a previous assessment to populate the current assessment.
              Any changes you have made will be overwritten.
            </Typography>
          }
        />
      )}
    </Grid>
  );
};

export default AssessmentForm;
