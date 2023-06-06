import AddIcon from '@mui/icons-material/Add';
import { Stack } from '@mui/material';

import { useProjectDashboardContext } from './ProjectDashboard';
import { ProjectReferralPostingsTable } from './tables/ProjectReferralPostingsTable';
import ProjectReferralRequestsTable from './tables/ProjectReferralRequestsTable';

import ButtonLink from '@/components/elements/ButtonLink';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectReferrals = () => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle title='Referrals' />
      <Stack spacing={4}>
        <TitleCard
          title='Referral Request'
          headerVariant='border'
          actions={
            project.access.canManageIncomingReferrals && (
              <ButtonLink
                to={generateSafePath(
                  ProjectDashboardRoutes.NEW_REFERRAL_REQUEST,
                  {
                    projectId: project.id,
                  }
                )}
                Icon={AddIcon}
              >
                New Referral Request
              </ButtonLink>
            )
          }
        >
          <ProjectReferralRequestsTable project={project} />
        </TitleCard>
        <TitleCard title='Incoming Referrals' headerVariant='border'>
          <ProjectReferralPostingsTable projectId={project.id} />
        </TitleCard>
      </Stack>
    </>
  );
};
export default ProjectReferrals;
