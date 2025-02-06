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
    render: (row: OutgoingReferral) => parseAndFormatDate(row.referralDate),
  },
  {
    header: 'HoH Name',
    render: 'hohName',
  },
  {
    header: 'Project Referred To',
    render: 'referredTo',
  },
  {
    header: 'Referred By',
    render: 'referredBy',
  },
  {
    header: 'Status',
    render: ({ status }: OutgoingReferral) => (
      <ReferralPostingStatusDisplay status={status} />
    ),
  },
  {
    header: 'Household Size',
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
      // If User has access to the receiving project, link to the Referral
      rowSecondaryActionConfigs={({ id, project, hohEnrollment }) => {
        if (!project) return []; // user does not have access to the receiving project

        // If we have a hohEnrollment (meaning the referral was accepted), link to it.
        // NOTE: its possible that "hohName" and the actual person on "hohEnrollment" don't actually match up,
        // if the Hoh was changed over time. Thats probably OK, the user can at least get to the right household.

        const enrollmentLinks = hohEnrollment
          ? [
              {
                title: 'View Enrollment',
                key: 'referral',
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
      }}
    />
  );
};

export default ProjectOutgoingReferralPostingsTable;
