import AddIcon from '@mui/icons-material/Add';
import { Paper, Stack, Typography } from '@mui/material';

import { useProjectDashboardContext } from './ProjectDashboard';
import ProjectReferralRequestsTable from './tables/ProjectsReferralRequestsTable';

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
          {/* FIXME: use canManageIncomingReferrals */}
          {project.access.canEditProjectDetails && (
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
        <ProjectReferralRequestsTable projectId={project.id} />
      </Paper>
      {/* TODO: Render a GenericTableWithData for Referrals */}
    </>
  );
};
export default ProjectReferrals;
