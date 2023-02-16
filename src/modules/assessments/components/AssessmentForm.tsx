import LockIcon from '@mui/icons-material/Lock';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { assign, cloneDeep } from 'lodash-es';
import { ReactNode, useCallback, useMemo, useState } from 'react';

import { useAssessmentHandlers } from './useAssessmentHandlers';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { ApolloErrorAlert } from '@/components/elements/ErrorFallback';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import DynamicForm, {
  DynamicFormProps,
} from '@/modules/form/components/DynamicForm';
import FormStepper from '@/modules/form/components/FormStepper';
import RecordPickerDialog from '@/modules/form/components/RecordPickerDialog';
import { getInitialValues } from '@/modules/form/util/formUtil';
import { RelatedRecord } from '@/modules/form/util/recordPickerUtil';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import {
  AssessmentRole,
  AssessmentWithDefinitionAndValuesFragment,
  AssessmentWithValuesFragment,
  EnrollmentFieldsFragment,
  FormDefinition,
  InitialBehavior,
} from '@/types/gqlTypes';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  // assessmentTitle: string;
  assessmentRole?: AssessmentRole;
  definition: FormDefinition;
  assessment?: AssessmentWithDefinitionAndValuesFragment;
  top?: number;
  navigationTitle: ReactNode;
  embeddedInWorkflow?: boolean;
  FormActionProps?: DynamicFormProps['FormActionProps'];
  locked?: boolean;
}

const AssessmentForm = ({
  assessment,
  assessmentRole,
  definition,
  navigationTitle,
  enrollment,
  embeddedInWorkflow,
  FormActionProps,
  locked = false,
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
}: Props) => {
  // Whether record picker dialog is open for autofill
  const [dialogOpen, setDialogOpen] = useState(false);

  // Most recently selected "source" assesment for autofill
  const [sourceAssessment, setSourceAssessment] = useState<
    AssessmentWithValuesFragment | undefined
  >();
  // Trigger for reloading initial values and form if a source assesment is chosen for autofill.
  // This is needed to support re-selecting the same assessment (which should clear and reload the form again)
  const [reloadInitialValues, setReloadInitialValues] = useState(false);

  const onSelectAutofillRecord = useCallback((record: RelatedRecord) => {
    setSourceAssessment(record as AssessmentWithValuesFragment);
    setDialogOpen(false);
    setReloadInitialValues((old) => !old);
  }, []);

  const {
    submitHandler,
    saveDraftHandler,
    mutationLoading,
    errors,
    apolloError,
  } = useAssessmentHandlers({
    definition,
    enrollmentId: enrollment.id,
    assessmentId: assessment?.id,
  });
  // Set initial values for the assessment. This happens on initial load,
  // and any time the user selects an assessment for autofilling the entire form.
  const initialValues = useMemo(() => {
    if (mutationLoading || !definition || !enrollment) return;

    // Local values that may be referenced by the FormDefinition
    const localConstants = {
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
    };

    const source = sourceAssessment || assessment;

    // Set initial values based solely on FormDefinition
    const init = getInitialValues(definition.definition, localConstants);
    if (source) {
      // Overlay initial values from source Assessment
      const initialFromSourceAssessment = cloneDeep(
        source.assessmentDetail?.values || {}
      );
      assign(init, initialFromSourceAssessment);

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
  ]);

  useScrollToHash(!enrollment || mutationLoading, top);

  // if (dataLoading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

  return (
    <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
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

          {!assessment && (
            <ButtonTooltipContainer title='Choose a previous assessment to copy into this assessment'>
              <Button
                variant='outlined'
                onClick={() => setDialogOpen(true)}
                sx={{ height: 'fit-content', mt: 3 }}
                fullWidth
              >
                Autofill Assessment
              </Button>
            </ButtonTooltipContainer>
          )}
          {import.meta.env.MODE === 'development' && assessment && (
            <Box sx={{ py: 2, px: 1 }}>
              <IdDisplay prefix='Assessment' id={assessment.id} />
            </Box>
          )}
        </Box>
      </Grid>
      <Grid item xs={9} sx={{ pt: '0 !important' }}>
        {apolloError && (
          <Box sx={{ mb: 3 }}>
            <ApolloErrorAlert error={apolloError} />
          </Box>
        )}
        {locked && (
          <Box sx={{ mb: 3 }}>
            <Alert severity='info' icon={<LockIcon />}>
              <AlertTitle>This assessment has been submitted.</AlertTitle>
            </Alert>
          </Box>
        )}
        <DynamicForm
          // Remount component if a source assessment has been selected
          key={`${assessment?.id}-${sourceAssessment?.id}-${reloadInitialValues}`}
          definition={definition.definition}
          onSubmit={submitHandler}
          onSaveDraft={
            assessment && !assessment.inProgress ? undefined : saveDraftHandler
          }
          initialValues={initialValues || undefined}
          pickListRelationId={enrollment?.project?.id}
          loading={mutationLoading}
          errors={errors}
          locked={locked}
          showSavePrompt
          showSavePromptInitial={embeddedInWorkflow ? true : undefined}
          FormActionProps={FormActionProps}
          // Only show "warn if empty" treatments if this is an existing assessment,
          // OR if the user has attempted to submit this (new) assessment
          warnIfEmpty={!!assessment || errors.length > 0}
        />
      </Grid>

      {/* Dialog for selecting autofill record */}
      {definition && (
        <RecordPickerDialog
          id='assessmentPickerDialog'
          recordType='Assessment'
          open={dialogOpen}
          role={assessmentRole}
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
