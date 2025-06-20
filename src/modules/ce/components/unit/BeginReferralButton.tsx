import { LoadingButton } from '@mui/lab';
import React, { useState } from 'react';
import { LoadingButtonProps } from '@/components/elements/LoadingButton';
import BeginReferralDialog from '@/modules/ce/components/unit/BeginReferralDialog';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import {
  CeCandidateFieldsFragment,
  CeOpportunityFieldsFragment,
} from '@/types/gqlTypes';

type Props = {
  opportunity: CeOpportunityFieldsFragment;
  candidate: CeCandidateFieldsFragment;
} & LoadingButtonProps;

const BeginReferralButton: React.FC<Props> = ({
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
        aria-label={`Begin Referral for ${clientNameFromRecordWithOptionalClient(candidate)}`}
        {...rest}
      >
        Begin Referral
      </LoadingButton>
      <BeginReferralDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        candidate={candidate}
        opportunity={opportunity}
      />
    </>
  );
};

export default BeginReferralButton;
