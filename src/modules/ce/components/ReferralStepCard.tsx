import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReferralStepCardInner from './ReferralStepCardInner';
import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import LoadingButton from '@/components/elements/LoadingButton';
import { GoToIcon } from '@/components/elements/SemanticIcons';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/ReferralPage';
import ReferralStepAssignee from '@/modules/ce/components/ReferralStepAssignee';
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
}

const ReferralStepCard: React.FC<Props> = ({ step }) => {
  const { projectId, opportunityId } = useSafeParams() as {
    projectId: string;
    opportunityId: string;
  };
  const { referral } = useReferralContext();
  const navigate = useNavigate();

  const { name, status } = step;

  const [startStepMutation, { loading, error }] =
    useStartCeReferralStepMutation({
      variables: {
        referralId: referral.id,
        stepId: step.stepId || '',
      },
      onCompleted: (data) => {
        if (data.startCeReferralStep?.step) {
          const step = data.startCeReferralStep?.step;

          // The step returned from the mutation is now auto added to the Apollo cache.
          // Here we are writing it to the cache specifically for the GetCeReferralStepDocument query,
          // so that when we navigate to the Step page, we don't do a double-fetch for the data we already have.
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
              referralId: referral.id,
              stepId: step.stepId || '',
            })
          );
        }
      },
    });

  const action = useMemo(() => {
    if (status === CeReferralStepStatus.Available) {
      return (
        <LoadingButton
          loading={loading}
          variant='text'
          endIcon={<GoToIcon />}
          onClick={() => startStepMutation()}
        >
          Start
        </LoadingButton>
      );
    }

    const buttonProps: ButtonLinkProps = {
      to: generateSafePath(ProjectDashboardRoutes.REFERRAL_STEP, {
        projectId,
        opportunityId,
        referralId: referral.id,
        stepId: step.stepId || '',
      }),
      variant: 'text',
      endIcon: <GoToIcon />,
    };

    if (status === CeReferralStepStatus.InProgress) {
      return <ButtonLink {...buttonProps}>View</ButtonLink>;
    }

    if (status === CeReferralStepStatus.Completed) {
      return (
        <ButtonLink {...buttonProps} color='grayscale'>
          View
        </ButtonLink>
      );
    }
  }, [
    loading,
    opportunityId,
    projectId,
    referral.id,
    startStepMutation,
    status,
    step.stepId,
  ]);

  if (error) throw error;

  return (
    <ReferralStepCardInner name={name} status={status} action={action}>
      <ReferralStepAssignee step={step} />
    </ReferralStepCardInner>
  );
};

export default ReferralStepCard;
