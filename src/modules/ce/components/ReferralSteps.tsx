import { Divider, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import useSearchParamsState from '@/hooks/useSearchParamState';
import { useReferralContext } from '@/modules/ce/components/ReferralPage';
import ReferralStepCard from '@/modules/ce/components/ReferralStepCard';
import ReferralWayfinder from '@/modules/ce/components/ReferralWayfinder';
import { CeReferralStepStatus } from '@/types/gqlTypes';

interface Props {}
const ReferralSteps: React.FC<Props> = () => {
  const { referral } = useReferralContext();

  const [{ wayfinding }, setFilterParams] = useSearchParamsState({
    wayfinding: { type: 'boolean', default: false },
  });

  const completedSteps = useMemo(() => {
    return (
      referral?.steps.filter((s) => s.status === CeReferralStepStatus.Completed)
        ?.length || 0
    );
  }, [referral?.steps]);
  const totalSteps = referral.steps.length;

  return (
    <>
      <Stack gap={2}>
        <Typography variant='h4' component='h2'>
          All Tasks
        </Typography>
        <Divider />
        <Typography variant='body1'>
          {completedSteps === totalSteps ? (
            'All'
          ) : (
            <>
              <strong>{completedSteps}</strong> of <strong>{totalSteps}</strong>
            </>
          )}{' '}
          Tasks Complete
        </Typography>
        {referral.steps.map((s) => (
          <ReferralStepCard key={s.id} step={s} />
        ))}
      </Stack>
      <ReferralWayfinder
        open={wayfinding}
        onClose={() => setFilterParams({ wayfinding: false })}
      />
    </>
  );
};

export default ReferralSteps;
