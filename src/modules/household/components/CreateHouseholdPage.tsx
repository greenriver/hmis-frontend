import { useMemo } from 'react';
import ManageHousehold from './ManageHousehold';
import BackButton from '@/components/elements/BackButton';
import PageTitle from '@/components/layout/PageTitle';
import useCurrentPath from '@/hooks/useCurrentPath';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const CreateHouseholdPage = () => {
  const { project } = useProjectDashboardContext();
  const currentPath = useCurrentPath();

  const [buttonText, buttonPath] = useMemo(() => {
    if (
      currentPath === ProjectDashboardRoutes.PROJECT_BED_NIGHTS_NEW_ENROLLMENT
    ) {
      return [
        'Back to Bed Night Management',
        generateSafePath(ProjectDashboardRoutes.PROJECT_BED_NIGHTS, {
          projectId: project.id,
        }),
      ];
    }
    return [
      'Back to Project Enrollments',
      generateSafePath(ProjectDashboardRoutes.PROJECT_ENROLLMENTS, {
        projectId: project.id,
      }),
    ];
  }, [currentPath, project.id]);

  return (
    <>
      <PageTitle title={`Enroll Household in ${project.projectName}`} />
      <ManageHousehold
        projectId={project.id}
        BackButton={<BackButton to={buttonPath}>{buttonText}</BackButton>}
      />
    </>
  );
};
export default CreateHouseholdPage;
