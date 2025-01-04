import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import DeleteAssessmentButton from './DeleteAssessmentButton';

import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import PrintViewButton from '@/components/layout/PrintViewButton';
import AssessmentAutofillButton from '@/modules/assessments/components/AssessmentAutofillButton';
import FormStepper from '@/modules/form/components/FormStepper';

import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  EnrollmentFieldsFragment,
  FormDefinitionFieldsFragment,
  FullAssessmentFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  definition: FormDefinitionFieldsFragment;
  assessment?: FullAssessmentFragment;
  embeddedInWorkflow?: boolean;
  onAutofill: VoidFunction;
  printPath?: string;
  isPrintView: boolean;
  locked: boolean;
  top?: number;
  showAutofill?: boolean;
}

const AssessmentFormSideBar: React.FC<Props> = ({
  enrollment,
  definition,
  assessment,
  embeddedInWorkflow,
  onAutofill,
  isPrintView,
  locked,
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
  showAutofill = true,
}) => {
  const navigate = useNavigate();
  const navigateToEnrollment = useMemo(
    () => () =>
      navigate(
        generateSafePath(EnrollmentDashboardRoutes.ASSESSMENTS, {
          clientId: enrollment.client.id,
          enrollmentId: enrollment.id,
        })
      ),
    [enrollment, navigate]
  );

  const showDeleteAssessmentButton = useMemo(() => {
    if (!assessment) return false;

    const { canDeleteAssessments, canEditEnrollments, canDeleteEnrollments } =
      assessment.access;

    // canEditEnrollments is required for deleting WIP or Submitted assessments
    if (!canEditEnrollments) return false;

    const isSubmitted = !assessment.inProgress;
    const deletesEnrollment = assessment.role === AssessmentRole.Intake;
    if (isSubmitted) {
      // canDeleteAssessments is required for deleting submitted assessments
      if (!canDeleteAssessments) return false;

      // canDeleteEnrollments is required for deleting submitted INTAKE assessments
      if (!canDeleteEnrollments && deletesEnrollment) return false;
    }

    return true;
  }, [assessment]);

  const showPrintViewButton = !isPrintView && locked && assessment;

  return (
    <Paper
      sx={{
        p: 2,
        position: 'sticky',
        top: top + 16,
        maxHeight: `calc(100vh - ${top + 16 * 2}px)`,
        overflowY: 'auto',
      }}
    >
      <Box>
        <Typography variant='body2' component='div'>
          Assessment Sections
        </Typography>
        <Divider sx={{ my: 2, mx: -2 }} />
      </Box>
      <FormStepper
        items={definition.definition.item}
        scrollOffset={top}
        useUrlHash={!embeddedInWorkflow}
      />
      {(showAutofill || showPrintViewButton || showDeleteAssessmentButton) && (
        <>
          <Divider sx={{ my: 2, mx: -2 }} />
          <Stack gap={2} sx={{ mt: 2 }}>
            {showAutofill && <AssessmentAutofillButton onClick={onAutofill} />}
            {showPrintViewButton && (
              <PrintViewButton
                openInNew
                to={generateSafePath(
                  EnrollmentDashboardRoutes.VIEW_ASSESSMENT,
                  {
                    clientId: assessment.enrollment.client.id,
                    enrollmentId: assessment.enrollment.id,
                    assessmentId: assessment.id,
                  }
                )}
              >
                Print
              </PrintViewButton>
            )}
            {showDeleteAssessmentButton && assessment && (
              <DeleteAssessmentButton
                assessment={assessment}
                clientId={enrollment.client.id}
                enrollmentId={enrollment.id}
                onSuccess={navigateToEnrollment}
              />
            )}
          </Stack>
        </>
      )}
    </Paper>
  );
};

export default AssessmentFormSideBar;
