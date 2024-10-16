import { Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import RouterLink from '@/components/elements/RouterLink';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { cache } from '@/providers/apolloClient';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import {
  AssessmentRole,
  DeleteAssessmentDocument,
  DeleteAssessmentMutation,
  DeleteAssessmentMutationVariables,
  FullAssessmentFragment,
} from '@/types/gqlTypes';
import { evictDeletedEnrollment } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

const DeleteAssessmentButton = ({
  assessment,
  clientId,
  onSuccess,
  enrollmentId,
}: {
  assessment: FullAssessmentFragment;
  clientId: string;
  enrollmentId: string;
  onSuccess?: VoidFunction;
}) => {
  const navigate = useNavigate();
  const deletesEnrollment = assessment.role === AssessmentRole.Intake;

  return (
    <DeleteMutationButton<
      DeleteAssessmentMutation,
      DeleteAssessmentMutationVariables
    >
      queryDocument={DeleteAssessmentDocument}
      variables={{
        id: assessment.id,
        assessmentLockVersion: assessment.lockVersion,
      }}
      idPath={'deleteAssessment.assessmentId'}
      ButtonProps={{ fullWidth: true }}
      recordName='assessment'
      deleteIcon
      onSuccess={() => {
        cache.evict({
          id: `Assessment:${assessment.id}`,
        });
        cache.evict({ id: `Client:${clientId}`, fieldName: 'assessments' });
        if (deletesEnrollment) {
          evictDeletedEnrollment({ enrollmentId, clientId });
          // If we deleted the enrollment, navigate back to the profile.
          // FIXME: this may result in "not found" if the user lost access to the client.
          // we should probably show a modal that says something like "Success! Go to Client|Home" depending on access
          navigate(
            generateSafePath(ClientDashboardRoutes.PROFILE, { clientId })
          );
        } else if (onSuccess) {
          onSuccess();
        }
      }}
      ConfirmationDialogProps={
        deletesEnrollment
          ? {
              title: 'Delete Enrollment',
              confirmText: 'Yes, delete enrollment',
              color: 'error',
            }
          : undefined
      }
      confirmationDialogContent={
        <Stack gap={1}>
          <Typography>
            Are you sure you want to delete this assessment?
          </Typography>
          {assessment.role === AssessmentRole.Intake && (
            <>
              <Typography fontWeight={600}>
                This will delete the enrollment.
              </Typography>

              <Typography>
                If there are other household members, you may need to{' '}
                <RouterLink
                  to={generateSafePath(
                    EnrollmentDashboardRoutes.EDIT_HOUSEHOLD,
                    {
                      clientId,
                      enrollmentId,
                    }
                  )}
                  variant='inherit'
                >
                  change the Head of Household
                </RouterLink>{' '}
                before taking this action.
              </Typography>
            </>
          )}
          {assessment.role === AssessmentRole.Exit && (
            <Typography>The client enrollment will be re-opened.</Typography>
          )}
        </Stack>
      }
    >
      Delete
    </DeleteMutationButton>
  );
};

export default DeleteAssessmentButton;
