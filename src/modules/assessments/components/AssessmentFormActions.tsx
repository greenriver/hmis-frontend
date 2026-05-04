import { Stack } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import DeleteAssessmentButton from './DeleteAssessmentButton';
import PrintViewButton from '@/components/layout/PrintViewButton';
import AssessmentAutofillButton from '@/modules/assessments/components/AssessmentAutofillButton';

import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  EnrollmentFieldsFragment,
  FullAssessmentFragment,
  RelationshipToHoH,
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

  const isHeadOfMultiMemberHousehold = useMemo(
    () =>
      enrollment.householdSize > 1 &&
      enrollment.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold,
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
              isHeadOfMultiMemberHousehold={isHeadOfMultiMemberHousehold}
            />
          )}
        </Stack>
      </>
    );
  }

  return null;
};

export default AssessmentFormActions;
