import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import DeleteAssessmentButton from './DeleteAssessmentButton';

import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import PrintViewButton from '@/components/layout/PrintViewButton';
import FormStepper from '@/modules/form/components/FormStepper';

import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  FormDefinition,
  FormRole,
  FullAssessmentFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  definition: FormDefinition;
  assessment?: FullAssessmentFragment;
  title: ReactNode;
  embeddedInWorkflow?: boolean;
  onAutofill: VoidFunction;
  printPath?: string;
  formRole?: FormRole;
  isPrintView: boolean;
  locked: boolean;
  canEdit: boolean;
  top?: number;
}

const AssessmentFormSideBar: React.FC<Props> = ({
  enrollment,
  definition,
  assessment,
  title,
  embeddedInWorkflow,
  onAutofill,
  formRole,
  isPrintView,
  locked,
  canEdit,
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
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

  return (
    <Paper sx={{ p: 2 }}>
      {title && (
        <Box>
          {title}
          <Divider sx={{ my: 2 }} />
        </Box>
      )}
      <FormStepper
        items={definition.definition.item}
        scrollOffset={top}
        useUrlHash={!embeddedInWorkflow}
      />
      <Divider sx={{ my: 2 }} />
      <Stack gap={2} sx={{ mt: 2 }}>
        {!assessment && canEdit && (
          <ButtonTooltipContainer title='Choose a previous assessment to copy into this assessment'>
            <Button
              variant='outlined'
              onClick={onAutofill}
              sx={{ height: 'fit-content' }}
              fullWidth
            >
              Autofill Assessment
            </Button>
          </ButtonTooltipContainer>
        )}
        {!isPrintView && locked && assessment && (
          <PrintViewButton
            // If embedded in household workflow, we need to link
            // over to the individual view for the specific assessment in order to print it
            openInNew={embeddedInWorkflow}
            to={
              embeddedInWorkflow
                ? generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
                    clientId: assessment.enrollment.client.id,
                    enrollmentId: assessment.enrollment.id,
                    assessmentId: assessment.id,
                    formRole,
                  })
                : undefined
            }
          >
            Print Assessment
          </PrintViewButton>
        )}
        {assessment && (
          <DeleteAssessmentButton
            assessment={assessment}
            clientId={enrollment.client.id}
            enrollmentId={enrollment.id}
            onSuccess={navigateToEnrollment}
          />
        )}
        {assessment && (
          <Typography color='text.secondary' variant='body2' sx={{ mt: 1 }}>
            <b>Assessment ID:</b> {assessment.id}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export default AssessmentFormSideBar;
