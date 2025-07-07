import { Stack } from '@mui/system';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import CommonCard from '@/components/elements/CommonCard';
import CommonDetailGrid, {
  CommonDetailGridItemRow,
} from '@/components/elements/CommonDetailGrid';
import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import RouterLink from '@/components/elements/RouterLink';
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import {
  clientNameFromRecordWithOptionalClient,
  entryExitRange,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeReferralFieldsFragment,
  ExternalIdentifierType,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  referral: CeReferralFieldsFragment;
}

const ReferralDetailContent: React.FC<Props> = ({ referral }) => {
  const referralDetails = useMemo(
    () => [
      {
        id: 'status',
        label: 'Referral Status',
        value: <ReferralStatusChip status={referral.status} size='small' />,
      },
      { id: 'id', label: 'Referral ID', value: referral.id },
      {
        id: 'referralDate',
        label: 'Date Started',
        value: parseAndFormatDate(referral.createdAt),
      },
      {
        id: 'unit',
        label: 'Unit',
        value: referral.opportunity.name,
      },
      {
        id: 'project',
        label: 'Project',
        value: referral.targetProjectName,
      },
    ],
    [referral]
  );

  const clientInformation = useMemo(() => {
    const rows: CommonDetailGridItemRow[] = [
      { id: 'clientId', label: 'Client ID', value: referral.clientId },
    ];

    if (referral.client) {
      rows.push({
        id: 'clientName',
        label: 'Client Name',
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
      });
      rows.push({
        id: 'age',
        label: 'Client Age',
        value: isNil(referral.client.age)
          ? 'N/A'
          : `${referral.client.age} years`,
      });

      const mciIds = referral.client.externalIds.filter(
        (eid) => eid.type === ExternalIdentifierType.MciId
      );
      if (mciIds.length > 0) {
        rows.push({
          id: 'mciId',
          label: 'MCI ID',
          value: (
            <Stack>
              {mciIds.map((mci) => (
                <ExternalIdDisplay key={mci.identifier} value={mci} />
              ))}
            </Stack>
          ),
        });
      }
    }

    // TODO(#7591): Dynamic display of Eligibility-related fields
    return rows;
  }, [referral]);

  const sourceEnrollmentDetails = useMemo(() => {
    if (!referral.sourceEnrollment) return null;
    const { id, projectName, projectType, access } = referral.sourceEnrollment;

    const rows: CommonDetailGridItemRow[] = [
      { id: 'projectName', label: 'Project Name', value: projectName },
      {
        id: 'projectType',
        label: 'Project Type',
        value: HmisEnums.ProjectType[projectType],
      },
      {
        id: 'entryExitDates',
        label: 'Entry/Exit Dates',
        value: entryExitRange(referral.sourceEnrollment),
      },
    ];
    if (access.canViewEnrollmentDetails) {
      rows.push({
        id: 'linkToEnrollment',
        label: 'Enrollment Link',
        value: (
          <RouterLink
            to={generateSafePath(
              EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
              {
                clientId: referral.clientId,
                enrollmentId: id,
              }
            )}
            openInNew
          >
            View Enrollment
          </RouterLink>
        ),
      });
    }
    return rows;
  }, [referral]);

  return (
    <Stack p={2} gap={2} sx={{ backgroundColor: 'background.default' }}>
      <CommonCard title='Referral Details' padContent={false}>
        <CommonDetailGrid rows={referralDetails} />
      </CommonCard>
      <CommonCard title='Client Information' padContent={false}>
        <CommonDetailGrid rows={clientInformation} />
      </CommonCard>
      {sourceEnrollmentDetails && (
        <CommonCard title='Source Enrollment' padContent={false}>
          <CommonDetailGrid rows={sourceEnrollmentDetails} />
        </CommonCard>
      )}
    </Stack>
  );
};

export default ReferralDetailContent;
