import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '@/components/elements/LoadingButton';
import { GoToIcon } from '@/components/elements/SemanticIcons';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
  GetCeReferralStepDocument,
  useStartCeReferralStepMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
  referralId: string;
  projectId: string;
  opportunityId: string;
  children: ReactNode;
}

const StartCeReferralStepButton: React.FC<Props> = ({
  step,
  referralId,
  projectId,
  opportunityId,
  children,
}) => {
  const navigate = useNavigate();

  const [startStepMutation, { loading, error }] =
    useStartCeReferralStepMutation({
      variables: {
        referralId: referralId,
        stepId: step.stepId || '',
      },
      onCompleted: (data) => {
        if (data.startCeReferralStep?.step) {
          const step = data.startCeReferralStep?.step;

          // The step returned from the mutation is now auto added to the Apollo cache.
          // Here we are writing it to the cache specifically for the GetCeReferralStepDocument query,
          // because the step is queried by `stepId` (the db ID) but cached by `id` (a composite ID).
          // We might have to return to these IDs in the future if there are issues
          cache.writeQuery({
            query: GetCeReferralStepDocument,
            data: {
              ceReferralStep: step,
            },
            variables: {
              id: step.stepId,
            },
          });

          navigate(
            generateSafePath(ProjectDashboardRoutes.REFERRAL_STEP, {
              projectId,
              opportunityId,
              referralId: referralId,
              stepId: step.stepId || '',
            })
          );
        }
      },
    });

  if (error) throw error;

  if (step.status !== CeReferralStepStatus.Available) return;

  return (
    <LoadingButton
      loading={loading}
      variant='text'
      endIcon={<GoToIcon />}
      onClick={() => startStepMutation()}
      aria-label={`Start step: ${step.name}`}
    >
      {children}
    </LoadingButton>
  );
};

export default StartCeReferralStepButton;
