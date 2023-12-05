import { Box, Stack, Typography } from '@mui/material';
import { Ref, useEffect, useMemo } from 'react';

import { assessmentDate } from '../util';

import AssessmentTitle from './AssessmentTitle';

import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import AssessmentForm from '@/modules/assessments/components/AssessmentForm';
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
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  ClientNameFragment,
  FormDefinition,
  FormRole,
  FullAssessmentFragment,
} from '@/types/gqlTypes';

export interface IndividualAssessmentProps {
  /**
   * FormDefiniton to use for rendering assessment
   */
  definition: FormDefinition;
  /**
   * Assessment to render, if one exists.
   */
  assessment?: FullAssessmentFragment;
  /**
   * Assessment Title
   */
  title: string;
  /**
   * ID of related Enrollment
   */
  enrollmentId: string;
  /**
   * Assessment Role (Intake, Exit, etc.)
   */
  formRole?: FormRole;
  /**
   * Whether the assessment is embedded in a household workflow
   */
  embeddedInWorkflow?: boolean;
  /**
   * Client information
   */
  client: ClientNameFragment;
  /**
   * Current status of the assessment
   */
  assessmentStatus?: AssessmentStatus;
  /**
   * Whether the form is currently visible on the page.
   * Used for household workflow when the assessment is on an inactive tab.
   */
  visible?: boolean;
  /**
   * Reference to the form
   */
  formRef?: Ref<DynamicFormRef>;
  /**
   * Callback to handle changes to form state
   */
  onFormStateChange?: (
    enrollmentId: string,
    action: HouseholdAssessmentFormAction
  ) => void;

  // DynamicForm props
  FormActionProps?: DynamicFormProps['FormActionProps'];
  onSubmit: DynamicFormProps['onSubmit'];
  onSaveDraft?: DynamicFormProps['onSaveDraft'];
  errors: ErrorState;
  mutationLoading?: boolean;
  onCancelValidations?: VoidFunction;
}

/**
 * Renders a single assessment form for an individual, including form stepper nav.
 *
 * If assessment is provided, we're editing an existing assessment.
 * If formRole is provided, we're creating a new assessment.
 */
const IndividualAssessment = ({
  enrollmentId,
  assessmentStatus,
  definition,
  title,
  assessment,
  formRole,
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
  const { overrideBreadcrumbTitles } = useClientDashboardContext();

  // Fetch the enrollment, which may be different from the current context enrollment if this assessment is part of a workflow.
  const { enrollment, loading: enrollmentLoading } =
    useBasicEnrollment(enrollmentId);

  const informationDate = useMemo(
    () => assessmentDate(formRole, enrollment),
    [enrollment, formRole]
  );

  useEffect(() => {
    if (!title || embeddedInWorkflow) return;
    overrideBreadcrumbTitles({
      [EnrollmentDashboardRoutes.ASSESSMENT]: title,
    });
  }, [
    embeddedInWorkflow,
    title,
    informationDate,
    assessment,
    overrideBreadcrumbTitles,
  ]);

  const topOffsetHeight =
    STICKY_BAR_HEIGHT +
    CONTEXT_HEADER_HEIGHT +
    (embeddedInWorkflow ? HOUSEHOLD_ASSESSMENTS_HEADER_HEIGHT : 0);

  useScrollToHash(enrollmentLoading, topOffsetHeight);

  if (enrollmentLoading) return <Loading />;
  if (!enrollment) return <NotFound />;
  if (!formRole && !assessment) return <NotFound />;

  const titleNode = (
    <AssessmentTitle
      assessmentTitle={title}
      clientName={clientBriefName(client)}
      projectName={enrollment.project.projectName}
      enrollmentId={enrollment.id}
      householdId={enrollment.householdId}
      assessmentRole={formRole as unknown as AssessmentRole}
      embeddedInWorkflow={embeddedInWorkflow}
      assessmentId={assessment?.id}
      householdSize={enrollment.householdSize}
    />
  );

  const navigationTitle = (
    <Box>
      <Typography variant='h5' sx={{ mb: 2 }}>
        {clientBriefName(client)}
      </Typography>
      <Stack gap={1}>
        <Typography variant='body2' component='div'>
          <b>{`${definition.title}: `}</b>
          {enrollment.project.projectName}
        </Typography>
        <AssessmentStatusIndicator status={assessmentStatus} />
      </Stack>
    </Box>
  );

  return (
    <AssessmentForm
      assessmentTitle={titleNode}
      clientId={client.id}
      navigationTitle={navigationTitle}
      key={assessment?.id}
      formRole={formRole}
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
    />
  );
};

const WrappedAssessment = (props: IndividualAssessmentProps) => (
  <Box sx={{ mt: 3 }}>
    <SentryErrorBoundary>
      <IndividualAssessment {...props} />
    </SentryErrorBoundary>
  </Box>
);

export default WrappedAssessment;
