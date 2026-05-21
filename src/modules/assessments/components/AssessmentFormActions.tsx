import { Stack } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import DeleteAssessmentButton from './DeleteAssessmentButton';
import PrintViewButton from '@/components/layout/PrintViewButton';
import AssessmentAutofillButton from '@/modules/assessments/components/AssessmentAutofillButton';

import { isHeadOfMultiMemberHousehold } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  FullAssessmentFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  enrollment: EnrollmentFieldsFragment;
  assessment?: FullAssessmentFragment;
  onAutofill: VoidFunction;
  isPrintView: boolean;
  locked: boolean;
  showAutofill?: boolean;
}

const AssessmentFormActions: React.FC<Props> = ({
  enrollment,
  assessment,
  onAutofill,
  isPrintView,
  locked,
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

  const showDeleteAssessmentButton = assessment?.access.canDelete;

  const showPrintViewButton = !isPrintView && locked && assessment;

  const isHoHInMultiMemberHousehold = useMemo(
    () => isHeadOfMultiMemberHousehold(enrollment),
    [enrollment]
  );

  if (showAutofill || showPrintViewButton || showDeleteAssessmentButton) {
    return (
      <>
        <Stack gap={2}>
          {showAutofill && <AssessmentAutofillButton onClick={onAutofill} />}
          {showPrintViewButton && (
            <PrintViewButton
              openInNew
              to={generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
                clientId: assessment.enrollment.client.id,
                enrollmentId: assessment.enrollment.id,
                assessmentId: assessment.id,
              })}
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
              isHeadOfMultiMemberHousehold={isHoHInMultiMemberHousehold}
            />
          )}
        </Stack>
      </>
    );
  }

  return null;
};

export default AssessmentFormActions;
