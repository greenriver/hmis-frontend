import CommonDetailGrid from '@/components/elements/CommonDetailGrid';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referral: CeReferralFieldsFragment;
}

// TODO(#7591) finish, re-style
const ReferralClientDetailContent: React.FC<Props> = ({ referral }) => {
  return (
    <CommonDetailGrid
      rows={[
        { id: 'id', label: 'Client ID', value: referral.clientId },
        {
          id: 'clientName',
          label: 'Client Name',
          value: clientNameFromRecordWithOptionalClient(referral),
        },
      ]}
    />
  );
};
export default ReferralClientDetailContent;
