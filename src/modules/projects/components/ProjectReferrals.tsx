import AddIcon from '@mui/icons-material/Add';
import { Paper, Stack, Typography } from '@mui/material';

import { useProjectDashboardContext } from './ProjectDashboard';
import ProjectReferralRequestsTable from './tables/ProjectReferralRequestsTable';
import { ProjectReferralPostingsTable } from './tables/ProjectsReferralPostingsTable';

import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectReferrals = () => {
  const { project } = useProjectDashboardContext();

  return (
    <>
      <PageTitle title='Referrals' />
      <Paper>
        <Stack
          justifyContent={'space-between'}
          direction='row'
          sx={{
            px: 2,
            pt: 2,
            pb: 3,
            alignItems: 'center',
            borderBottomColor: 'borders.light',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
          }}
        >
          <Typography variant='h5'>Referral Requests</Typography>
          {project.access.canManageIncomingReferrals && (
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
          )}
        </Stack>
        <ProjectReferralRequestsTable project={project} />
      </Paper>
      <Paper sx={{ my: 4 }}>
        <Stack
          justifyContent={'space-between'}
          direction='row'
          sx={{
            px: 2,
            pt: 2,
            pb: 3,
            alignItems: 'center',
            borderBottomColor: 'borders.light',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
          }}
        >
          <Typography variant='h5'>Incoming Referrals</Typography>
        </Stack>
        <ProjectReferralPostingsTable projectId={project.id} />
      </Paper>
    </>
  );
};
export default ProjectReferrals;
