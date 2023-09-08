import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useIsPrintView from '@/hooks/useIsPrintView';
import useSafeParams from '@/hooks/useSafeParams';
import HouseholdAssessments from '@/modules/assessments/components/household/HouseholdAssessments';
import { isHouseholdAssesmentRole } from '@/modules/assessments/components/household/util';
import IndividualAssessment from '@/modules/assessments/components/IndividualAssessment';
import { FormActionTypes } from '@/modules/form/types';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { EnrollmentFieldsFragment, FormRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const showAssessmentInHousehold = (
  enrollment?: EnrollmentFieldsFragment,
  role?: string
) => {
  return (
    enrollment &&
    role &&
    enrollment.householdSize > 1 &&
    isHouseholdAssesmentRole(role)
  );
};

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { client, enrollment } = useEnrollmentDashboardContext();
  const { clientId, enrollmentId, assessmentId, formRole } =
    useSafeParams() as {
      clientId: string;
      enrollmentId: string;
      formRole: FormRole;
      assessmentId?: string;
    };
  const isPrintView = useIsPrintView();
  const clientName = clientBriefName(client);

  const navigateToEnrollment = useCallback(
    () =>
      navigate(
        generateSafePath(EnrollmentDashboardRoutes.ASSESSMENTS, {
          enrollmentId,
          clientId,
        })
      ),
    [navigate, enrollmentId, clientId]
  );

  const onSuccess = useCallback(() => {
    // We created a NEW assessment, clear assessment queries from cache before navigating so the table reloads
    if (!assessmentId) {
      cache.evict({
        id: `Enrollment:${enrollmentId}`,
        fieldName: 'assessments',
      });
    }
    navigateToEnrollment();
  }, [navigateToEnrollment, assessmentId, enrollmentId]);

  if (!enrollment) return <NotFound />;
  if (!formRole) return <NotFound />;

  // If household has 2+ members and this is a household assessment, render household workflow
  if (
    isHouseholdAssesmentRole(formRole) &&
    showAssessmentInHousehold(enrollment, formRole) &&
    !isPrintView
  ) {
    return <HouseholdAssessments role={formRole} enrollment={enrollment} />;
  }

  return (
    <IndividualAssessment
      formRole={formRole}
      enrollmentId={enrollmentId}
      clientName={clientName}
      assessmentId={assessmentId}
      client={client}
      relationshipToHoH={enrollment.relationshipToHoH}
      getFormActionProps={(assessment) => ({
        onDiscard: navigateToEnrollment,
        config: [
          {
            id: 'submit',
            label: 'Submit',
            action: FormActionTypes.Submit,
            buttonProps: { variant: 'contained' },
            onSuccess,
          },
          ...(assessment && !assessment.inProgress
            ? []
            : [
                {
                  id: 'saveDraft',
                  label: 'Save and finish later',
                  action: FormActionTypes.Save,
                  buttonProps: { variant: 'outlined' },
                  onSuccess,
                },
              ]),
          {
            id: 'discard',
            label: 'Cancel',
            action: FormActionTypes.Discard,
            buttonProps: { variant: 'gray' },
          },
        ],
      })}
    />
  );
};

export default AssessmentPage;
