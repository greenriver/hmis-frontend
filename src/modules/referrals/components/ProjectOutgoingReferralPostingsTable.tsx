import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import { useReferralFilter } from '@/modules/referrals/hooks/useReferralFilter';
import {
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
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
    header: 'HoH',
    render: ({ hohName, hohEnrollment }: OutgoingReferral) => {
      if (!hohEnrollment) return hohName;

      // If we have a hohEnrollment, link to it.
      // NOTE: its possible that "hohName" and the actual person on "hohEnrollment" don't actually match up,
      // if the Hoh was changed over time. Thats probably OK, the user can at least get to the right household.
      const enrollmentPath = generateSafePath(
        EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
        {
          clientId: hohEnrollment.client.id,
          enrollmentId: hohEnrollment.id,
        }
      );
      return (
        <RouterLink to={enrollmentPath} openInNew>
          {hohName}
        </RouterLink>
      );
    },
  },
  {
    header: 'Project Referred To',
    linkTreatment: true,
    render: ({ id, referredTo, project }: OutgoingReferral) => {
      if (!project) return referredTo; // user does not have access to the full project object, so just show the project name

      const projectPath = generateSafePath(
        ProjectDashboardRoutes.REFERRAL_POSTING,
        {
          projectId: project.id,
          referralPostingId: id,
        }
      );
      return (
        <>
          <RouterLink to={projectPath} openInNew>
            {project.projectName}
          </RouterLink>
          <HmisEnum
            value={project.projectType}
            enumMap={HmisEnums.ProjectType}
          />
        </>
      );
    },
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
    />
  );
};

export default ProjectOutgoingReferralPostingsTable;
