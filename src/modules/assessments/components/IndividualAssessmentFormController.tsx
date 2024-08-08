import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AssessmentResponseStatus,
  useAssessmentHandlers,
} from '../hooks/useAssessmentHandlers';
import IndividualAssessment from '@/modules/assessments/components/IndividualAssessment';
import { FormActionTypes } from '@/modules/form/types';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { cache } from '@/providers/apolloClient';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  EnrolledClientFieldsFragment,
  FormDefinitionFieldsFragment,
  FullAssessmentFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  enrollment: DashboardEnrollment;
  client: EnrolledClientFieldsFragment;
  definition: FormDefinitionFieldsFragment;
  assessment?: FullAssessmentFragment;
}

/**
 * Wraps IndividualAssessment for creating/editing/viewing an assessment.
 * This is only used for individual assessment pages, NOT for household assessment.
 */
const IndividualAssessmentFormController: React.FC<Props> = ({
  client,
  enrollment,
  definition,
  assessment,
}) => {
  const navigate = useNavigate();
  const navigateToEnrollment = useCallback(
    () =>
      navigate(
        generateSafePath(EnrollmentDashboardRoutes.ASSESSMENTS, {
          enrollmentId: enrollment.id,
          clientId: client.id,
        })
      ),
    [navigate, enrollment, client]
  );

  const onCompletedMutation = useCallback(
    (status: AssessmentResponseStatus) => {
      if (!['saved', 'submitted'].includes(status)) return;
      // If we created a NEW assessment, evict Enrollment from the cache.
      if (!assessment) {
        cache.evict({ id: `Enrollment:${enrollment.id}` });
      }
      navigateToEnrollment();
    },
    [navigateToEnrollment, assessment, enrollment]
  );

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
      stackOnMobile: true,
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

  return (
    <IndividualAssessment
      definition={definition}
      assessment={assessment}
      enrollmentId={enrollment.id}
      client={client}
      onSubmit={submitHandler}
      onSaveDraft={saveDraftHandler}
      errors={errors}
      mutationLoading={mutationLoading}
      FormActionProps={FormActionProps}
    />
  );
};

export default IndividualAssessmentFormController;
