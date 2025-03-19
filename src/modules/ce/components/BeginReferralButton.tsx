import { LoadingButton } from '@mui/lab';
import React from 'react';
import { LoadingButtonProps } from '@/components/elements/LoadingButton';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  CeCandidateFieldsFragment,
  useCreateCeReferralMutation,
} from '@/types/gqlTypes';

type Props = {
  opportunityId: string;
  candidate: CeCandidateFieldsFragment;
} & LoadingButtonProps;

const BeginReferralButton: React.FC<Props> = ({
  opportunityId,
  candidate,
  ...rest
}) => {
  const [createReferral, { loading, error }] = useCreateCeReferralMutation({
    variables: {
      opportunityId,
      clientId: candidate.client.id,
      input: {
        participants: [], // TODO(#7351) - assign participants
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
      aria-label={`Begin Referral for ${clientBriefName(candidate.client)}`}
      {...rest}
    >
      Begin Referral
    </LoadingButton>
  );
};

export default BeginReferralButton;
