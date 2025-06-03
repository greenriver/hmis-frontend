import { Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import LoadingButton from '@/components/elements/LoadingButton';
import { cache } from '@/providers/apolloClient';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
  GetCeReferralStepDocument,
  useStartCeReferralStepMutation,
} from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
  referralId: string;
  path: string;
}

const ReferralStepAction: React.FC<Props> = ({ step, referralId, path }) => {
  const { status, name } = step;
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

          navigate(path);
        }
      },
    });

  if (error) throw error;

  if (status === CeReferralStepStatus.Available && step.access.canPerformStep) {
    return (
      <LoadingButton
        loading={loading}
        onClick={() => startStepMutation()}
        aria-label={`Start step: ${name}`}
      >
        Start
      </LoadingButton>
    );
  }

  if (status === CeReferralStepStatus.InProgress) {
    return (
      <ButtonLink
        variant='contained'
        to={path}
        aria-label={`View step: ${name}`}
      >
        View
      </ButtonLink>
    );
  }

  if (status === CeReferralStepStatus.Completed) {
    return (
      <ButtonLink aria-label={`View step: ${name}`} to={path} color='grayscale'>
        View
      </ButtonLink>
    );
  }

  // Either the step is unavailable, or the current user does not have permission to start it
  return <Button disabled>Start</Button>;
};

export default ReferralStepAction;
