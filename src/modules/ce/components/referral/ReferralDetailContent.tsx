import { Stack } from '@mui/system';
import { isNil } from 'lodash-es';
import CommonCard from '@/components/elements/CommonCard';
import CommonDetailGrid from '@/components/elements/CommonDetailGrid';
import RouterLink from '@/components/elements/RouterLink';
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import {
  clientNameFromRecordWithOptionalClient,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { ClientDashboardRoutes } from '@/routes/routes';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  referral: CeReferralFieldsFragment;
}

const ReferralDetailContent: React.FC<Props> = ({ referral }) => {
  return (
    <Stack p={2} gap={2} sx={{ backgroundColor: 'background.default' }}>
      <CommonCard title='Referral Details' padContent={false}>
        <CommonDetailGrid
          rows={[
            {
              id: 'status',
              label: 'Referral Status',
              value: (
                <ReferralStatusChip status={referral.status} size='small' />
              ),
            },
            { id: 'id', label: 'Referral ID', value: referral.id },
            {
              id: 'referralDate',
              label: 'Date Started',
              value: parseAndFormatDate(referral.createdAt),
            },
            {
              id: 'project',
              label: 'Project',
              value: referral.targetProjectName,
            },
            {
              id: 'unit',
              label: 'Unit',
              value: referral.opportunity.name,
            },
          ]}
        />
      </CommonCard>
      <CommonCard title='Client Information' padContent={false}>
        <CommonDetailGrid
          rows={[
            { id: 'clientId', label: 'Client ID', value: referral.clientId },
            {
              id: 'clientName',
              label: 'Client Name',
              // TODO(#7591) make this link conditionally (requires resolving additional access field)
              value: (
                <RouterLink
                  to={generateSafePath(ClientDashboardRoutes.PROFILE, {
                    clientId: referral.clientId,
                  })}
                  openInNew
                >
                  {clientNameFromRecordWithOptionalClient(referral)}
                </RouterLink>
              ),
            },
            {
              id: 'age',
              label: 'Client Age',
              value: isNil(referral.client?.age)
                ? 'N/A'
                : `${referral.client.age} years`,
            },
            // TODO(#7591): Link to Source Enrollment, if permitted
            // TODO(#7591): Dynamic display of Eligibility-related fields
          ]}
        />
      </CommonCard>
    </Stack>
  );
};
export default ReferralDetailContent;
