import { Grid } from '@mui/material';

import ManageHousehold from './ManageHousehold';

import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';

const CreateHouseholdPage = () => {
  const { project } = useProjectDashboardContext();
  return (
    <Grid container spacing={4} sx={{ pt: 2, pb: 10 }}>
      <Grid item xs={12}>
        <ManageHousehold projectId={project.id} />
      </Grid>
    </Grid>
  );
};
export default CreateHouseholdPage;
