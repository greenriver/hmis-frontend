import React, { useMemo } from 'react';
import ReferralStepCardInner from './ReferralStepCardInner';
import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import { GoToIcon } from '@/components/elements/SemanticIcons';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/ReferralPage';
import ReferralStepAssignee from '@/modules/ce/components/ReferralStepAssignee';
import StartCeReferralStepButton from '@/modules/ce/components/StartCeReferralStepButton';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
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
  const { name, status } = step;

  const action = useMemo(() => {
    if (status === CeReferralStepStatus.Available) {
      return (
        <StartCeReferralStepButton
          step={step}
          referralId={referral.id}
          opportunityId={opportunityId}
          projectId={projectId}
        >
          Start
        </StartCeReferralStepButton>
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
  }, [opportunityId, projectId, referral.id, status, step]);

  return (
    <ReferralStepCardInner name={name} status={status} action={action}>
      <ReferralStepAssignee
        step={step}
        participants={referral.participants || []}
      />
    </ReferralStepCardInner>
  );
};

export default ReferralStepCard;
