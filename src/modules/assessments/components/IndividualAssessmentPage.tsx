import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAssessment } from '../hooks/useAssessment';
import {
  AssessmentResponseStatus,
  useAssessmentHandlers,
} from '../hooks/useAssessmentHandlers';
import MissingDefinitionAlert from './MissingDefinitionAlert';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessment from '@/modules/assessments/components/IndividualAssessment';
import { FormActionTypes } from '@/modules/form/types';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { cache } from '@/providers/apolloClient';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { ClientNameDobVetFragment, FormRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  enrollment: DashboardEnrollment;
  client: ClientNameDobVetFragment;
}

const IndividualAssessmentPage: React.FC<Props> = ({ client, enrollment }) => {
  const navigate = useNavigate();
  const { clientId, enrollmentId, assessmentId, formRole } =
    useSafeParams() as {
      clientId: string;
      enrollmentId: string;
      formRole: FormRole;
      assessmentId?: string;
    };

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

  const onCompletedMutation = useCallback(
    (status: AssessmentResponseStatus) => {
      if (!['saved', 'submitted'].includes(status)) return;
      // We created a NEW assessment, clear assessment queries from cache before navigating so the table reloads
      if (!assessmentId) {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'assessments',
        });
      }
      navigateToEnrollment();
    },
    [navigateToEnrollment, assessmentId, enrollmentId]
  );

  const {
    definition,
    assessment,
    loading: dataLoading,
    assessmentTitle,
    formRole: role,
  } = useAssessment({
    enrollmentId,
    assessmentId,
    formRoleParam: formRole,
    client,
    relationshipToHoH: enrollment?.relationshipToHoH,
  });

  const { submitHandler, saveDraftHandler, mutationLoading, errors } =
    useAssessmentHandlers({
      definition,
      enrollmentId: enrollment.id,
      assessmentId: assessment?.id,
      assessmentLockVersion: assessment?.lockVersion,
      onCompletedMutation,
    });

  const FormActionProps = useMemo(() => {
    return {
      onDiscard: navigateToEnrollment,
      config: [
        {
          id: 'submit',
          label: 'Submit',
          action: FormActionTypes.Submit,
          buttonProps: { variant: 'contained' } as const,
        },
        ...(assessment && !assessment.inProgress
          ? []
          : [
              {
                id: 'saveDraft',
                label: 'Save and finish later',
                action: FormActionTypes.Save,
                buttonProps: { variant: 'outlined' } as const,
              },
            ]),
        {
          id: 'discard',
          label: 'Cancel',
          action: FormActionTypes.Discard,
          buttonProps: { variant: 'gray' } as const,
        },
      ],
    };
  }, [assessment, navigateToEnrollment]);

  if (!formRole) return <NotFound />;
  if (dataLoading) return <Loading />;
  if (!definition) return <MissingDefinitionAlert />;

  return (
    <IndividualAssessment
      definition={definition}
      assessment={assessment}
      formRole={role}
      enrollmentId={enrollmentId}
      title={assessmentTitle}
      client={client}
      onSubmit={submitHandler}
      onSaveDraft={saveDraftHandler}
      errors={errors}
      mutationLoading={mutationLoading}
      FormActionProps={FormActionProps}
    />
  );
};

export default IndividualAssessmentPage;
