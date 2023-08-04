import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Grid } from '@mui/material';

import ManageHousehold from './ManageHousehold';
import ButtonLink from '@/components/elements/ButtonLink';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const CreateHouseholdPage = () => {
  const { project } = useProjectDashboardContext();
  return (
    <Grid container spacing={4} sx={{ pt: 2, pb: 10 }}>
      <Grid item xs={12}>
        <ManageHousehold
          projectId={project.id}
          BackButton={
            <ButtonLink
              startIcon={<ArrowBackIcon />}
              variant='gray'
              size='small'
              sx={{ width: 'fit-content' }}
              to={generateSafePath(ProjectDashboardRoutes.PROJECT_ENROLLMENTS, {
                projectId: project.id,
              })}
            >
              Back to Project Enrollments
            </ButtonLink>
          }
        />
      </Grid>
    </Grid>
  );
};
export default CreateHouseholdPage;
