import { assessmentRole } from '../util';

import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { useClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import {
  AssessmentFieldsFragment,
  DeleteAssessmentDocument,
  DeleteAssessmentMutation,
  DeleteAssessmentMutationVariables,
  FormRole,
} from '@/types/gqlTypes';

const DeleteAssessmentButton = ({
  assessment,
  clientId,
  onSuccess,
}: {
  assessment: AssessmentFieldsFragment;
  clientId: string;
  onSuccess?: VoidFunction;
}) => {
  const [{ canDeleteAssessments = false, canEditEnrollments = false } = {}] =
    useClientPermissions(clientId);

  if (assessment.inProgress && !canEditEnrollments) return null;
  if (!assessment.inProgress && !canDeleteAssessments) return null;
  if (!assessment.inProgress && assessmentRole(assessment) === FormRole.Intake)
    return null;

  return (
    <DeleteMutationButton<
      DeleteAssessmentMutation,
      DeleteAssessmentMutationVariables
    >
      queryDocument={DeleteAssessmentDocument}
      variables={{ id: assessment.id }}
      idPath={'deleteAssessment.assessment.id'}
      ButtonProps={{ fullWidth: true }}
      recordName='assessment'
      onSuccess={() => {
        cache.evict({
          id: `Assessment:${assessment.id}`,
        });
        cache.evict({ id: `Client:${clientId}`, fieldName: 'assessments' });
        if (onSuccess) onSuccess();
      }}
    >
      Delete Assessment
    </DeleteMutationButton>
  );
};

export default DeleteAssessmentButton;
