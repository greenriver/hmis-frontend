import CommonDetailGrid from '@/components/elements/CommonDetailGrid';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referral: CeReferralFieldsFragment;
}

// TODO(#7591) finish, re-style
const ReferralDetailContent: React.FC<Props> = ({ referral }) => {
  return (
    <CommonDetailGrid
      rows={[
        { id: 'id', label: 'Referral ID', value: referral.id },
        { id: 'clientId', label: 'Client ID', value: referral.clientId },
        {
          id: 'clientName',
          label: 'Client Name',
          value: clientNameFromRecordWithOptionalClient(referral),
        },
        {
          id: 'unit',
          label: 'Unit Name',
          value: referral.opportunity.name,
        },
        {
          id: 'workflow',
          label: 'Referral Workflow',
          value: referral.workflowTemplateName,
        },
        // Project Name?
        // Project ID?
        // Client ID?
        // Referral Start Date
        // Link to Target Enrollment, if exists
      ]}
    />
  );
};
export default ReferralDetailContent;
