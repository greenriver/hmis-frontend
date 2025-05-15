import { Divider, Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import NotFound from '@/components/pages/NotFound';
import useSearchParamsState from '@/hooks/useSearchParamState';
import { useReferralContext } from '@/modules/ce/components/ReferralPage';
import ReferralStepCard from '@/modules/ce/components/ReferralStepCard';
import ReferralWayfinder from '@/modules/ce/components/ReferralWayfinder';
import { CeReferralStepStatus } from '@/types/gqlTypes';

interface Props {}
const ReferralSteps: React.FC<Props> = () => {
  const { referral } = useReferralContext();

  const [{ wayfinding }, setFilterParams] = useSearchParamsState({
    paramsDefinition: {
      wayfinding: { type: 'boolean', default: false },
    },
  });

  const completedSteps = useMemo(() => {
    return (
      referral?.steps.filter((s) => s.status === CeReferralStepStatus.Completed)
        ?.length || 0
    );
  }, [referral?.steps]);
  const totalSteps = referral?.steps.length;

  if (!referral) return <NotFound />;

  return (
    <>
      <Stack gap={2}>
        <Paper>
          <Typography sx={{ p: 2 }} variant='h5' component='h2'>
            All Referral Tasks
          </Typography>
          <Divider />

          <Stack
            direction='row'
            sx={{ px: 2, py: 1 }}
            justifyContent='space-between'
            alignItems='center'
          >
            <Stack direction='row' gap={2}>
              <Typography variant='body2'>
                {completedSteps === totalSteps ? 'All' : completedSteps} tasks
                completed
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {referral.steps.map((s) => (
          <ReferralStepCard key={s.id} step={s} referral={referral} />
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
