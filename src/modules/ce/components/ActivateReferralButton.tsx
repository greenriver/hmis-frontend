import { LoadingButton } from '@mui/lab';
import React from 'react';
import { cache } from '@/providers/apolloClient';
import {
  CeCandidateFieldsFragment,
  useCreateCeReferralMutation,
} from '@/types/gqlTypes';

interface Props {
  opportunityId: string;
  candidate: CeCandidateFieldsFragment;
}

const ActivateReferralButton: React.FC<Props> = ({
  opportunityId,
  candidate,
}) => {
  const [createReferral, { loading, error }] = useCreateCeReferralMutation({
    variables: {
      opportunityId,
      clientId: candidate.client.id,
      input: {
        participants: [], // hard-coded for now
      },
    },
    onCompleted: (data) => {
      if (data.createCeReferral?.referral) {
        cache.modify({
          id: `CeOpportunity:${opportunityId}`,
          fields: {
            activeReferral() {
              return data.createCeReferral?.referral;
            },
          },
        });
      }
    },
  });

  if (error) throw error;

  return (
    <LoadingButton
      onClick={() => createReferral()}
      loading={loading}
      color='grayscale'
    >
      Activate referral
    </LoadingButton>
  );
};

export default ActivateReferralButton;
