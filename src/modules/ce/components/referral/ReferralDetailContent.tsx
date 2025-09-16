import { Stack } from '@mui/system';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import CommonCollapsibleCard from '@/components/elements/CommonCollapsibleCard';
import CommonDetailGrid, {
  CommonDetailGridItemRow,
} from '@/components/elements/CommonDetailGrid';
import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import RouterLink from '@/components/elements/RouterLink';
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import { entryExitRange, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeReferralFieldsFragment,
  ExternalIdentifierType,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  referral: CeReferralFieldsFragment;
  linkToProject?: boolean;
}

const ReferralDetailContent: React.FC<Props> = ({
  referral,
  linkToProject = false,
}) => {
  const referralDetails = useMemo(
    () => [
      {
        id: 'status',
        label: 'Referral Status',
        value: <ReferralStatusChip referral={referral} size='small' />,
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
        value: referral.opportunity?.name,
      },
      {
        id: 'project',
        label: 'Project',
        value:
          referral.access.canViewTargetProject && linkToProject ? (
            <RouterLink
              to={generateSafePath(ProjectDashboardRoutes.OVERVIEW, {
                projectId: referral.targetProjectId,
              })}
              openInNew
            >
              {referral.targetProjectName}
            </RouterLink>
          ) : (
            referral.targetProjectName
          ),
      },
      ...(referral.targetEnrollment
        ? [
            {
              id: 'targetEnrollment',
              label: 'Destination Enrollment',
              value: (
                <RouterLink
                  to={generateSafePath(
                    EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                    {
                      clientId: referral.targetEnrollment?.client?.id,
                      enrollmentId: referral.targetEnrollment?.id,
                    }
                  )}
                  aria-label={`View Enrollment at ${referral.targetProjectName}`}
                  openInNew
                >
                  View Enrollment
                </RouterLink>
              ),
            },
          ]
        : []),
    ],
    [linkToProject, referral]
  );

  const clientDetails = useMemo(() => {
    const { clientId, clientName, clientAge, client } = referral;

    const rows: CommonDetailGridItemRow[] = [
      { id: 'clientId', label: 'Client ID', value: clientId },
      {
        id: 'clientName',
        label: 'Client Name',
        value: client ? (
          <RouterLink
            to={generateSafePath(ClientDashboardRoutes.PROFILE, {
              clientId: referral.clientId,
            })}
            openInNew
          >
            {clientName}
          </RouterLink>
        ) : (
          clientName
        ),
      },
      {
        id: 'age',
        label: 'Client Age',
        value: isNil(clientAge) ? 'N/A' : `${clientAge} years`,
      },
    ];

    if (client) {
      const mciIds = client.externalIds.filter(
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

    // Display current "match values", meaning fields that are referenced by
    // any of this referral's eligibility or prioritization rules.
    // For example if the rule is "cde.custom_assessment.requires_accessible_unit = 'Yes'", then
    // the interface will display "Requires Accessible Unit: Yes". The value will be the CURRENT value
    // for this client (as evaluated by the Match Engine), so it may no longer match the eligibility rule.
    (referral.currentMatchValues || [])
      .filter(({ fieldName }) => fieldName.toLowerCase() !== 'current age') // exclude "Current Age" as it is redundant with the age field
      .forEach(({ id, fieldName, fieldValues }) => {
        rows.push({
          id,
          label: fieldName,
          value: (
            <Stack>
              {fieldValues?.map((fv) => <span key={fv}>{fv}</span>)}
            </Stack>
          ),
        });
      });

    return rows;
  }, [referral]);

  const sourceEnrollmentDetails = useMemo(() => {
    if (!referral.sourceEnrollment) return null;
    const { id, projectName, projectType } = referral.sourceEnrollment;

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
    if (referral.access.canViewSourceEnrollmentDetails) {
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

  const eligibilityRequirementsDetails = useMemo(() => {
    if (!referral.opportunity?.eligibilityRequirements) return null;
    const { eligibilityRequirements } = referral.opportunity;

    return eligibilityRequirements.map((requirement) => ({
      id: requirement.id,
      label: null,
      value: requirement.name,
    }));
  }, [referral]);

  return (
    <Stack
      p={2}
      gap={2}
      sx={{
        backgroundColor: 'background.default',
        mb: 6,
        '.MuiTypography-h5': { fontSize: 16 }, // custom: reduce font size of CommonCard header
      }}
    >
      <CommonCollapsibleCard
        title='Referral Details'
        TitleComponent='h3'
        padContent={false}
        initialOpen
      >
        <CommonDetailGrid rows={referralDetails} />
      </CommonCollapsibleCard>
      <CommonCollapsibleCard
        title='Client Details'
        TitleComponent='h3'
        padContent={false}
        initialOpen
      >
        <CommonDetailGrid rows={clientDetails} />
      </CommonCollapsibleCard>
      {sourceEnrollmentDetails && (
        <CommonCollapsibleCard
          title='Source Enrollment Details'
          TitleComponent='h3'
          padContent={false}
        >
          <CommonDetailGrid rows={sourceEnrollmentDetails} />
        </CommonCollapsibleCard>
      )}

      {eligibilityRequirementsDetails &&
        eligibilityRequirementsDetails.length > 0 && (
          <CommonCollapsibleCard
            title='Eligibility Requirements'
            TitleComponent='h3'
            padContent={false}
          >
            <CommonDetailGrid rows={eligibilityRequirementsDetails} />
          </CommonCollapsibleCard>
        )}
    </Stack>
  );
};

export default ReferralDetailContent;
