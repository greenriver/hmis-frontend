import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ButtonLink, { ButtonLinkProps } from '@/components/elements/ButtonLink';
import CommonCard from '@/components/elements/CommonCard';
import LoadingButton from '@/components/elements/LoadingButton';
import { CompletedIcon, GoToIcon } from '@/components/elements/SemanticIcons';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/ReferralNav';
import ReferralStepAssignee from '@/modules/ce/components/ReferralStepAssignee';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralStepStatus,
  CeReferralStepSummaryFieldsFragment,
  useStartCeReferralStepMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  step: CeReferralStepSummaryFieldsFragment;
}
const ReferralStepSummary: React.FC<Props> = ({ step }) => {
  const { projectId, opportunityId } = useSafeParams() as {
    projectId: string;
    opportunityId: string;
  };
  const { referral } = useReferralContext();
  const navigate = useNavigate();

  const { name, status } = step;

  const sx = useMemo(() => {
    switch (status) {
      case CeReferralStepStatus.Available:
      case CeReferralStepStatus.InProgress:
        return {
          borderColor: 'primary.main',
          borderLeftWidth: '5px',
        };
      case CeReferralStepStatus.Completed:
        return {
          borderColor: 'grayscale.light',
          borderLeftWidth: '5px',
          backgroundColor: 'grayscale.surface',
        };
      case CeReferralStepStatus.Unavailable:
        return {
          borderColor: 'borders.light',
          borderLeftWidth: '5px',
          color: 'text.secondary',
        };
      default:
        return {};
    }
  }, [status]);

  const [startStepMutation, { loading, error }] =
    useStartCeReferralStepMutation({
      variables: {
        referralId: referral.id,
        stepId: step.stepId || '',
      },
      onCompleted: (data) => {
        if (!!data.startCeReferralStep?.step) {
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

  const icon =
    status === CeReferralStepStatus.Completed ? CompletedIcon : undefined;

  return (
    <CommonCard title={name} Icon={icon} sx={sx} actions={action}>
      <ReferralStepAssignee step={step} />
    </CommonCard>
  );
};

export default ReferralStepSummary;
