import { useCallback } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import { useReferralFilter } from '@/modules/referrals/hooks/useReferralFilter';
import {
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import {
  GetProjectOutgoingReferralPostingsDocument,
  GetProjectOutgoingReferralPostingsQuery,
  GetProjectOutgoingReferralPostingsQueryVariables,
  ReferralPostingStatus,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type OutgoingReferral = NonNullable<
  GetProjectOutgoingReferralPostingsQuery['project']
>['outgoingReferralPostings']['nodes'][0];

const columns: ColumnDef<OutgoingReferral>[] = [
  {
    header: 'Referral Date',
    key: 'referralDate',
    render: (row: OutgoingReferral) => parseAndFormatDate(row.referralDate),
  },
  {
    header: 'HoH Name',
    key: 'hohName',
    render: 'hohName',
  },
  {
    header: 'Project Referred To',
    key: 'referredTo',
    render: 'referredTo',
  },
  {
    header: 'Referred By',
    key: 'referredBy',
    render: 'referredBy',
  },
  {
    header: 'Status',
    key: 'status',
    render: ({ status }: OutgoingReferral) => (
      <ReferralPostingStatusDisplay status={status} />
    ),
  },
  {
    header: 'Household Size',
    key: 'householdSize',
    render: 'householdSize',
  },
];

interface Props {
  projectId: string;
}

const ProjectOutgoingReferralPostingsTable: React.FC<Props> = ({
  projectId,
}) => {
  const referralFilter = useReferralFilter([
    ReferralPostingStatus.AssignedStatus,
    ReferralPostingStatus.AcceptedPendingStatus,
    ReferralPostingStatus.DeniedPendingStatus,
    ReferralPostingStatus.AcceptedStatus,
    ReferralPostingStatus.DeniedStatus,
  ]);

  const rowSecondaryActionConfigs = useCallback(
    ({ id, project, hohEnrollment }: OutgoingReferral) => {
      // User does not have access to the receiving project, so we can't link to anything.
      if (!project) return [];

      // If we have a hohEnrollment (meaning the referral was accepted), link to it.
      // NOTE: its possible that "hohName" and the actual person on "hohEnrollment" don't actually match up,
      // if the Hoh was changed over time. Thats probably OK, the user can at least get to the right household.

      const enrollmentLinks = hohEnrollment
        ? [
            {
              title: 'View Enrollment',
              key: 'enrollment',
              ariaLabel: `View Enrollment at ${project.projectName}`,
              to: generateSafePath(
                EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                {
                  clientId: hohEnrollment.client.id,
                  enrollmentId: hohEnrollment.id,
                }
              ),
            },
          ]
        : [];

      return [
        ...enrollmentLinks,
        {
          title: 'View Referral',
          key: 'referral',
          ariaLabel: `View Referral, ${project.projectName}`,
          to: generateSafePath(ProjectDashboardRoutes.REFERRAL_POSTING, {
            projectId: project.id,
            referralPostingId: id,
          }),
        },
      ];
    },
    []
  );

  return (
    <GenericTableWithData<
      GetProjectOutgoingReferralPostingsQuery,
      GetProjectOutgoingReferralPostingsQueryVariables,
      OutgoingReferral
    >
      queryVariables={{ id: projectId }}
      queryDocument={GetProjectOutgoingReferralPostingsDocument}
      columns={columns}
      noData='No referrals'
      pagePath='project.outgoingReferralPostings'
      filters={{ status: referralFilter }}
      defaultPageSize={15}
      paginationItemName='outgoing referral'
      rowSecondaryActionConfigs={rowSecondaryActionConfigs}
    />
  );
};

export default ProjectOutgoingReferralPostingsTable;
