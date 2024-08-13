import { Box, Stack, Typography } from '@mui/material';
import { Ref, useMemo } from 'react';

import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import NotFound from '@/components/pages/NotFound';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import AssessmentForm from '@/modules/assessments/components/AssessmentForm';
import AssessmentRelatedAnnualsAlert from '@/modules/assessments/components/AssessmentRelatedAnnualsAlert';
import AssessmentStatusIndicator from '@/modules/assessments/components/AssessmentStatusIndicator';
import { HouseholdAssessmentFormAction } from '@/modules/assessments/components/household/formState';
import { AssessmentStatus } from '@/modules/assessments/components/household/util';
import { useBasicEnrollment } from '@/modules/enrollment/hooks/useBasicEnrollment';
import SentryErrorBoundary from '@/modules/errors/components/SentryErrorBoundary';
import { ErrorState } from '@/modules/errors/util';
import {
  DynamicFormProps,
  DynamicFormRef,
} from '@/modules/form/components/DynamicForm';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  AssessedClientFieldsFragment,
  AssessmentRole,
  FormDefinitionFieldsFragment,
  FullAssessmentFragment,
} from '@/types/gqlTypes';

export interface IndividualAssessmentProps {
  // FormDefiniton to use for rendering the assessment
  definition: FormDefinitionFieldsFragment;
  // Assessment to render. Omit if starting a new assessment.
  assessment?: FullAssessmentFragment;
  enrollmentId: string;
  // Whether the assessment is embedded in a household workflow
  embeddedInWorkflow?: boolean;
  client: AssessedClientFieldsFragment;
  // Assessment status to use for indicator
  assessmentStatus?: AssessmentStatus;
  // Whether the form is currently visible on the page. Used for household workflow when the assessment is on an inactive tab.
  visible?: boolean;
  // Reference to the form element
  formRef?: Ref<DynamicFormRef>;
  // Callback to handle changes to form state
  onFormStateChange?: (
    enrollmentId: string,
    action: HouseholdAssessmentFormAction
  ) => void;
  // Props to pass to the FormActions component to specify button layout and actions
  FormActionProps?: DynamicFormProps['FormActionProps'];
  // Submit handler
  onSubmit: DynamicFormProps['onSubmit'];
  // Save handler (unsubmitted assessments only)
  onSaveDraft?: DynamicFormProps['onSaveDraft'];
  // Error state
  errors: ErrorState;
  // Whether Submit or Save mutation is loading
  mutationLoading?: boolean;
  // Callback for clicking "cancel" on warning validation modal
  onCancelValidations?: VoidFunction;
}

/**
 * Renders a single assessment form for an individual, including form stepper nav.
 *
 * If assessment is provided, we're editing an existing assessment.
 * Otherwise, we're creating a new assessment.
 *
 * This component is used by both individual assessment page & household assessments page.
 */
const IndividualAssessment = ({
  enrollmentId,
  assessmentStatus,
  definition,
  assessment,
  embeddedInWorkflow = false,
  client,
  FormActionProps,
  visible,
  formRef,
  onFormStateChange,
  onSubmit,
  onSaveDraft,
  errors,
  mutationLoading,
  onCancelValidations,
}: IndividualAssessmentProps) => {
  // Fetch the enrollment, which may be different from the current context enrollment if this assessment is part of a workflow.
  const { enrollment, loading: enrollmentLoading } =
    useBasicEnrollment(enrollmentId);

  const topOffsetHeight =
    STICKY_BAR_HEIGHT +
    CONTEXT_HEADER_HEIGHT +
    (embeddedInWorkflow ? HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT : 0);

  useScrollToHash(enrollmentLoading, topOffsetHeight);

  const navigationTitle = useMemo(() => {
    if (!enrollment) return;
    if (!embeddedInWorkflow) {
      return (
        <Typography variant='body2' component='div'>
          Assessment Sections
        </Typography>
      );
    }
    return (
      <Box>
        <Typography variant='h5' sx={{ mb: 2 }}>
          {clientBriefName(client)}
        </Typography>
        <Stack gap={1}>
          <Typography variant='body2' component='div'>
            {/* this will be the legacy title. movie this to its own component too */}
            <b>{`${definition.title}: `}</b>
            {enrollment.project.projectName}
          </Typography>
          <AssessmentStatusIndicator status={assessmentStatus} />
        </Stack>
      </Box>
    );
  }, [
    assessmentStatus,
    client,
    definition.title,
    embeddedInWorkflow,
    enrollment,
  ]);

  if (enrollmentLoading) return <Loading />;
  if (!enrollment) return <NotFound />;
  if (!definition && !assessment) return <NotFound />;

  const alertNode = (
    <AssessmentRelatedAnnualsAlert
      enrollmentId={enrollment.id}
      householdId={enrollment.householdId}
      assessmentRole={definition.role as unknown as AssessmentRole}
      embeddedInWorkflow={embeddedInWorkflow}
      assessmentId={assessment?.id}
      householdSize={enrollment.householdSize}
    />
  );

  return (
    <AssessmentForm
      alerts={alertNode}
      client={client}
      navigationTitle={navigationTitle}
      key={assessment?.id}
      definition={definition}
      assessment={assessment}
      enrollment={enrollment}
      top={topOffsetHeight}
      embeddedInWorkflow={embeddedInWorkflow}
      FormActionProps={FormActionProps}
      visible={visible}
      formRef={formRef}
      onFormStateChange={onFormStateChange}
      onSubmit={onSubmit}
      onSaveDraft={onSaveDraft}
      errors={errors}
      mutationLoading={mutationLoading}
      onCancelValidations={onCancelValidations}
      assessmentStatus={assessmentStatus}
    />
  );
};

const WrappedAssessment = (props: IndividualAssessmentProps) => (
  <Box sx={{ mt: 0 }}>
    <SentryErrorBoundary>
      <IndividualAssessment {...props} />
    </SentryErrorBoundary>
  </Box>
);

export default WrappedAssessment;
