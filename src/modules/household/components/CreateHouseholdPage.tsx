import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ManageHousehold from './ManageHousehold';
import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const CreateHouseholdPage = () => {
  const { project } = useProjectDashboardContext();
  return (
    <>
      <PageTitle title={`Enroll Household in ${project.projectName}`} />
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
    </>
  );
};
export default CreateHouseholdPage;
