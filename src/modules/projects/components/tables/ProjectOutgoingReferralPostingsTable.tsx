import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import {
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectOutgoingReferralPostingsDocument,
  GetProjectOutgoingReferralPostingsQuery,
  GetProjectOutgoingReferralPostingsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

type OutgoingReferral = NonNullable<
  GetProjectOutgoingReferralPostingsQuery['project']
>['outgoingReferralPostings']['nodes'][0];

const columns: ColumnDef<OutgoingReferral>[] = [
  {
    header: 'Referral Date',
    render: (row: OutgoingReferral) => parseAndFormatDate(row.referralDate),
  },
  {
    header: 'Project Referred To',
    linkTreatment: true,
    render: ({ id, project }: OutgoingReferral) => {
      if (!project) return null;

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
    />
  );
};

export default ProjectOutgoingReferralPostingsTable;
