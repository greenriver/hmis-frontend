import { Box, Divider, Stack } from '@mui/material';
import React, { useEffect } from 'react';
import ReferralStepDetails from './ReferralStepDetails';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonCard from '@/components/elements/CommonCard';
import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import { BackIcon } from '@/components/elements/SemanticIcons';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/referral/ReferralPage';
import ReferralStepForm from '@/modules/ce/components/referral/ReferralStepForm';
import {
  CeReferralStepStatus,
  useGetCeReferralStepQuery,
} from '@/types/gqlTypes';

const ReferralStep: React.FC = ({}) => {
  const { referral, referralPath, overrideStepTitle } = useReferralContext();
  const { stepId } = useSafeParams() as {
    stepId: string;
  };

  const {
    data: { ceReferralStep: step } = {},
    loading: fetchLoading,
    error: fetchError,
  } = useGetCeReferralStepQuery({
    variables: {
      id: stepId,
    },
  });

  const stepSummary = referral.steps?.find((s) => s.stepId === stepId);

  useEffect(() => {
    if (stepSummary?.name) overrideStepTitle?.(stepSummary.name);
  }, [overrideStepTitle, stepSummary?.name]);

  if (fetchError) throw fetchError;
  if (!stepSummary) return <NotFound />;
  if (!fetchLoading && !step) return <NotFound />;

  if (
    [CeReferralStepStatus.Unavailable, CeReferralStepStatus.Available].includes(
      stepSummary.status
    )
  ) {
    // The step has to be started from the Referral Steps page
    return <NotFound />;
  }

  return (
    <Stack direction='column' gap={2}>
      <Box sx={{ alignSelf: 'start' }}>
        <ButtonLink variant='text' startIcon={<BackIcon />} to={referralPath}>
          Back to All Tasks
        </ButtonLink>
      </Box>
      <CommonCard title={stepSummary.name}>
        <Stack gap={2}>
          <ReferralStepDetails step={stepSummary} />
          <Divider />
          {fetchLoading && !step && <LoadingSkeleton count={1} height={200} />}
          {step && <ReferralStepForm step={step} />}
        </Stack>
      </CommonCard>
    </Stack>
  );
};

export default ReferralStep;
