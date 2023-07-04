import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectOutgoingReferralPostingsQuery,
  GetProjectOutgoingReferralPostingsQueryVariables,
  GetProjectReferralPostingsDocument,
  ReferralPostingFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<ReferralPostingFieldsFragment>[] = [
  {
    header: 'Referral Date',
    render: (row: ReferralPostingFieldsFragment) =>
      parseAndFormatDate(row.referralDate),
  },
  {
    header: 'Project Referred To',
    linkTreatment: true,
    render: ({ project }: ReferralPostingFieldsFragment) =>
      project ? (
        <>
          <RouterLink
            to={generateSafePath(Routes.PROJECT, {
              projectId: project.id,
            })}
          >
            {project.projectName}
          </RouterLink>
          <HmisEnum
            value={project.projectType}
            enumMap={HmisEnums.ProjectType}
          />
        </>
      ) : null,
  },
  {
    header: 'Referred By',
    render: 'referredBy',
  },
  {
    header: 'Status',
    render: (row: ReferralPostingFieldsFragment) => (
      <ReferralPostingStatusDisplay status={row.status} />
    ),
  },
  {
    header: 'HoH',
    render: 'hohName',
    linkTreatment: true,
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
      ReferralPostingFieldsFragment
    >
      queryVariables={{ id: projectId }}
      queryDocument={GetProjectReferralPostingsDocument}
      columns={columns}
      noData='No referrals'
      pagePath='project.incomingReferralPostings'
    />
  );
};

export default ProjectOutgoingReferralPostingsTable;
