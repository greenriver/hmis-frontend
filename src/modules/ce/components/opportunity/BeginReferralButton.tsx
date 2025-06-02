import { LoadingButton } from '@mui/lab';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingButtonProps } from '@/components/elements/LoadingButton';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
  useCreateCeReferralMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type Props = {
  opportunityId: string;
  projectId: string;
  candidate: CeCandidateFieldsFragment;
} & LoadingButtonProps;

const BeginReferralButton: React.FC<Props> = ({
  opportunityId,
  projectId,
  candidate,
  ...rest
}) => {
  const navigate = useNavigate();

  const [createReferral, { loading, error }] = useCreateCeReferralMutation({
    variables: {
      opportunityId,
      clientId: candidate.clientId,
    },
    onCompleted: (data) => {
      if (data.createCeReferral?.referral) {
        const referral = data.createCeReferral.referral;

        cache.modify({
          id: `CeOpportunity:${opportunityId}`,
          fields: {
            referral() {
              return referral;
            },
          },
        });

        navigate(
          generateSafePath(ProjectDashboardRoutes.REFERRAL, {
            projectId: projectId,
            referralId: referral.id,
          })
        );
      }
    },
  });

  if (error) throw error;

  return (
    <LoadingButton
      onClick={() => createReferral()}
      loading={loading}
      color='grayscale'
      aria-label={`Begin Referral for ${clientNameFromRecordWithOptionalClient(candidate)}`}
      {...rest}
    >
      Begin Referral
    </LoadingButton>
  );
};

export default BeginReferralButton;
