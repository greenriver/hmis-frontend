import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import LoadingButton from '@/components/elements/LoadingButton';
import ValidationErrorSnackbarAlert from '@/modules/errors/components/ValidationErrorSnackbarAlert';
import {
  emptyErrorState,
  ErrorState,
  hasAnyValue,
  partitionValidations,
} from '@/modules/errors/util';
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
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [startStepMutation, { loading, error }] =
    useStartCeReferralStepMutation({
      variables: {
        referralId: referralId,
        stepId: step.stepId || '',
      },
      onCompleted: (data) => {
        const errors = data.startCeReferralStep?.errors || [];
        if (errors.length > 0) {
          setErrorState(partitionValidations(errors));
        } else if (data.startCeReferralStep?.step) {
          setErrorState(emptyErrorState);

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

  const buttonSx = { width: '116px' };
  const { canPerformStep } = step.access;

  // If the step is "Available" (meaning nobody has clicked "Start" yet), we need to perform a mutation to initialize it
  if (status === CeReferralStepStatus.Available && canPerformStep) {
    return (
      <>
        {hasAnyValue(errorState) && (
          <ValidationErrorSnackbarAlert errors={errorState.errors} />
        )}
        <LoadingButton
          sx={buttonSx}
          loading={loading}
          onClick={() => startStepMutation()}
          aria-label={`Start step: ${name}`}
        >
          Start
        </LoadingButton>
      </>
    );
  }

  // If the step is "In Progress", just link to the step page.
  // Someone has already kicked off the "Start Step" mutation, but we don't save in-progress form values,
  // so from the user's perspective, whether or not the step is "started" isn't very meaningful.
  if (status === CeReferralStepStatus.InProgress && canPerformStep) {
    return (
      <ButtonLink
        sx={buttonSx}
        variant='contained'
        to={path}
        aria-label={`Start step: ${name}`}
      >
        Start
      </ButtonLink>
    );
  }

  // If the step is "Completed", link to step page to review it. Anyone who can view the referral can review completed steps.
  if (status === CeReferralStepStatus.Completed) {
    return (
      <ButtonLink
        sx={buttonSx}
        aria-label={`View step: ${name}`}
        to={path}
        color='grayscale'
        variant='contained'
      >
        Review
      </ButtonLink>
    );
  }

  // Step is unavailable or user does not have permission to perform it.
  return null;
};

export default ReferralStepAction;
