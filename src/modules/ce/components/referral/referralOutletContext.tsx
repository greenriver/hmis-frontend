import { useOutletContext } from 'react-router-dom';

import { CeReferralFieldsFragment } from '@/types/gqlTypes';

export type ReferralContext = {
  referral: CeReferralFieldsFragment;
  referralPath: string;
  unitPath?: string;
  generateReferralStepPath: (stepId: string) => string;
  overrideStepTitle?: (name: string | undefined) => void;
};

export const useReferralContext = () => useOutletContext<ReferralContext>();
