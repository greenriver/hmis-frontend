import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { cache } from '@/providers/apolloClient';
import {
  AssessmentFieldsFragment,
  DeleteAssessmentDocument,
  DeleteAssessmentMutation,
  DeleteAssessmentMutationVariables,
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
  const [canEditEnrollments] = useHasClientPermissions(clientId, [
    'canEditEnrollments',
  ]);
  if (!canEditEnrollments) return null;

  // TODO: should require `canDeleteAssessments` to delete assessment if !assessment.inProgress
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
