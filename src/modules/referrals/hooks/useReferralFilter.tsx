import { useMemo } from 'react';
import { getReferralFilter } from '../referralUtil';
import { ReferralPostingStatus } from '@/types/gqlTypes';

export const useReferralFilter = (statuses: ReferralPostingStatus[]) => {
  return useMemo(() => getReferralFilter(statuses), [statuses]);
};
