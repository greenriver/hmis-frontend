import UnlockIcon from '@mui/icons-material/Lock';
import { Grid, Typography } from '@mui/material';
import { assign } from 'lodash-es';
import {
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAssessmentHandlers } from '../hooks/useAssessmentHandlers';

import AssessmentAlert from './alerts/AssessmentAlert';

import FormContainer from '@/components/layout/FormContainer';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import useIsPrintView from '@/hooks/useIsPrintView';
import usePrintTrigger from '@/hooks/usePrintTrigger';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import AssessmentFormSideBar from '@/modules/assessments/components/AssessmentFormSideBar';
import { hasAnyValue } from '@/modules/errors/util';
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
  createInitialValuesFromRecord,
  getInitialValues,
  getItemMap,
  initialValuesFromAssessment,
} from '@/modules/form/util/formUtil';
import {
  EnrollmentFieldsFragment,
  FormDefinition,
  FormRole,
  FullAssessmentFragment,
  InitialBehavior,
} from '@/types/gqlTypes';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  clientId: string;
  formRole?: FormRole;
  definition: FormDefinition;
  assessment?: FullAssessmentFragment;
  assessmentTitle?: ReactNode;
  top?: number;
  navigationTitle: ReactNode;
  embeddedInWorkflow?: boolean;
  FormActionProps?: DynamicFormProps['FormActionProps'];
  visible?: boolean;
  formRef?: Ref<DynamicFormRef>;
  onInflight: (clientId: string, value: boolean) => void;
}

const AssessmentForm: React.FC<Props> = ({
  assessment,
  clientId,
  assessmentTitle,
  formRole,
  definition,
  navigationTitle,
  enrollment,
  embeddedInWorkflow,
  FormActionProps,
  formRef,
  visible = true,
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
  onInflight,
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
  }, [assessment, canEdit]);

  // Most recently selected "source" assessment for autofill
  const [sourceAssessment, setSourceAssessment] = useState<
    FullAssessmentFragment | undefined
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

  const { submitHandler, saveDraftHandler, mutationLoading, errors } =
    useAssessmentHandlers({
      definition,
      enrollmentId: enrollment.id,
      assessmentId: assessment?.id,
      assessmentLockVersion: assessment?.lockVersion,
      onSuccessfulSubmit: (assmt) => {
        if (!assmt.inProgress) setLocked(true);
      },
    });

  const handleDirty = useCallback(
    (value: boolean) => {
      onInflight(clientId, value);
    },
    [onInflight, clientId]
  );

  const itemMap = useMemo(
    () => getItemMap(definition.definition),
    [definition]
  );

  // Local values that may be referenced by the FormDefinition
  const localConstants = useMemo(
    () => ({
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
      ...AlwaysPresentLocalConstants,
    }),
    [enrollment]
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

  // the form is locked, replace the submit button with an 'unlock' button
  const formActionPropsWithLock = useMemo<typeof FormActionProps>(() => {
    if (!locked || !FormActionProps || !canEdit) return FormActionProps;

    const config = (FormActionProps.config?.slice() || [])
      .map((item) => {
        if (item.action != FormActionTypes.Submit) return item;
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
    return { ...FormActionProps, config };
  }, [FormActionProps, locked, canEdit, embeddedInWorkflow, handleUnlock]);

  const navigation = (
    <Grid item xs={2.5} sx={{ pr: 2, pt: '0 !important' }}>
      <AssessmentFormSideBar
        enrollment={enrollment}
        definition={definition}
        assessment={assessment}
        title={navigationTitle}
        formRole={formRole}
        isPrintView={isPrintView}
        locked={locked}
        embeddedInWorkflow={embeddedInWorkflow}
        onAutofill={() => setDialogOpen(true)}
        canEdit={canEdit}
        top={top}
      />
    </Grid>
  );

  const showNavigation = !isPrintView;

  return (
    <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
      {showNavigation && navigation}
      <Grid item xs={showNavigation ? 9.5 : 12} sx={{ pt: '0 !important' }}>
        {assessmentTitle}
        {!isPrintView && (
          <AssessmentAlert
            assessment={assessment}
            locked={locked}
            allowUnlock={canEdit && !embeddedInWorkflow}
            onUnlock={handleUnlock}
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
            />
          </FormContainer>
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
            localConstants={localConstants}
            initialValues={initialValues || undefined}
            pickListArgs={pickListArgs}
            loading={mutationLoading}
            errors={errors}
            locked={locked}
            visible={visible}
            clientId={clientId}
            showSavePrompt
            alwaysShowSaveSlide={!!embeddedInWorkflow}
            FormActionProps={FormActionProps}
            onDirty={handleDirty}
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
          clientId={clientId}
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
