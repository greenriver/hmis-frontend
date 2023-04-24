import { useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessment from '@/modules/assessments/components/IndividualAssessment';
import { FormActionTypes } from '@/modules/form/types';
import { cache } from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import { FormRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const NewAssessmentPage = () => {
  const { client, enrollment } = useOutletContext<DashboardContext>();
  const { clientId, enrollmentId, formRole } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    formRole: FormRole; // If create new, we have the role.
  };
  const navigate = useNavigate();

  const navigateToEnrollment = useCallback(
    () =>
      navigate(
        generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
          enrollmentId,
          clientId,
        })
      ),
    [navigate, enrollmentId, clientId]
  );

  const onSuccess = useCallback(() => {
    // We created a NEW assessment, clear assessment queries from cache before navigating so the table reloads
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'assessments',
    });
    navigateToEnrollment();
  }, [navigateToEnrollment, enrollmentId]);

  if (!enrollment) return <Loading />;

  return (
    <IndividualAssessment
      enrollmentId={enrollmentId}
      formRole={formRole}
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

export default NewAssessmentPage;
