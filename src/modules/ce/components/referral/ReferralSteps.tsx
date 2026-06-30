import { Divider, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import NotFound from '@/components/pages/NotFound';
import useSearchParamsState from '@/hooks/useSearchParamState';
import ReferralMetadataHeader from '@/modules/ce/components/referral/ReferralMetadataHeader';
import { useReferralContext } from '@/modules/ce/components/referral/ReferralPage';
import ReferralStepCard from '@/modules/ce/components/referral/ReferralStepCard';
import ReferralWayfinder from '@/modules/ce/components/referral/ReferralWayfinder';
import { CeReferralStepStatus } from '@/types/gqlTypes';

interface Props {}
const ReferralSteps: React.FC<Props> = () => {
  const { referral, generateReferralStepPath } = useReferralContext();

  const [{ wayfinding }, setFilterParams] = useSearchParamsState({
    paramsDefinition: {
      wayfinding: { type: 'boolean', default: false },
    },
  });

  const open = useMemo(() => {
    return (
      referral?.steps?.filter((s) => {
        return [
          CeReferralStepStatus.InProgress,
          CeReferralStepStatus.Available,
        ].includes(s.status);
      }) || []
    );
  }, [referral?.steps]);

  const completed = useMemo(() => {
    return (
      referral?.steps?.filter((s) => {
        return s.status === CeReferralStepStatus.Completed;
      }) || []
    );
  }, [referral?.steps]);

  const unavailable = useMemo(() => {
    return (
      referral?.steps?.filter((s) => {
        return s.status === CeReferralStepStatus.Unavailable;
      }) || []
    );
  }, [referral?.steps]);

  const taskMap = useMemo(() => {
    return {
      Open: open,
      Completed: completed,
      Unavailable: unavailable,
    };
  }, [completed, open, unavailable]);

  if (!referral) return <NotFound />;

  return (
    <>
      <Stack gap={4}>
        {open.length === 0 && <ReferralMetadataHeader referral={referral} />}
        {Object.entries(taskMap).map(([key, steps]) => {
          if (steps.length === 0) return null;

          return (
            <Stack gap={2} key={key}>
              <Stack direction='row' alignItems='center' gap={2}>
                <Typography variant='h5' component='h2'>
                  {key} Tasks ({steps.length})
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Stack>
              {key === 'Open' && open.length > 0 && (
                <ReferralMetadataHeader referral={referral} />
              )}
              {steps.map((s) => (
                <ReferralStepCard
                  key={s.id}
                  step={s}
                  path={generateReferralStepPath(s.stepId || '')}
                  referral={referral}
                />
              ))}
            </Stack>
          );
        })}
      </Stack>
      <ReferralWayfinder
        open={wayfinding}
        onClose={() => setFilterParams({ wayfinding: false })}
      />
    </>
  );
};

export default ReferralSteps;
