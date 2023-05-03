import { useNavigate } from 'react-router-dom';

import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import IndividualAssessment from '@/modules/assessments/components/IndividualAssessment';
import { FormActionTypes } from '@/modules/form/types';

const ViewAssessmentPage = () => {
  const navigate = useNavigate();
  const { client, enrollment } = useClientDashboardContext();
  const { enrollmentId, assessmentId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    assessmentId: string;
  };

  if (!enrollment) return <NotFound />;

  return (
    <IndividualAssessment
      assessmentId={assessmentId}
      enrollmentId={enrollmentId}
      client={client}
      relationshipToHoH={enrollment.relationshipToHoH}
      getFormActionProps={(assessment) => ({
        onDiscard: () => navigate(-1),
        config: [
          {
            id: 'submit',
            label: 'Submit',
            action: FormActionTypes.Submit,
            buttonProps: { variant: 'contained' },
            onSuccess: () => navigate(-1),
          },
          ...(assessment && !assessment.inProgress
            ? []
            : [
                {
                  id: 'saveDraft',
                  label: 'Save and finish later',
                  action: FormActionTypes.Save,
                  buttonProps: { variant: 'outlined' },
                  onSuccess: () => navigate(-1),
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

export default ViewAssessmentPage;
