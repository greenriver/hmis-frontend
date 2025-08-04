import { LoadingButton } from '@mui/lab';
import React, { useState } from 'react';
import { LoadingButtonProps } from '@/components/elements/LoadingButton';
import StartReferralDialog from '@/modules/ce/components/unit/StartReferralDialog';
import {
  CeCandidateFieldsFragment,
  CeOpportunityFieldsFragment,
} from '@/types/gqlTypes';

type Props = {
  opportunity: CeOpportunityFieldsFragment;
  candidate: CeCandidateFieldsFragment;
} & LoadingButtonProps;

const StartReferralButton: React.FC<Props> = ({
  opportunity,
  candidate,
  ...rest
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <LoadingButton
        onClick={() => setDialogOpen(true)}
        color='grayscale'
        aria-label={`Start Referral for ${candidate.clientName}`}
        {...rest}
      >
        Start Referral
      </LoadingButton>
      <StartReferralDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        candidate={candidate}
        opportunity={opportunity}
      />
    </>
  );
};

export default StartReferralButton;
