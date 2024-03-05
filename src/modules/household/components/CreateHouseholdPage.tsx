import { useMemo } from 'react';
import ManageHousehold from './ManageHousehold';
import BackButton from '@/components/elements/BackButton';
import PageTitle from '@/components/layout/PageTitle';
import useCurrentPath from '@/hooks/useCurrentPath';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';

const CreateHouseholdPage = () => {
  const { project } = useProjectDashboardContext();
  const currentPath = useCurrentPath();

  const buttonText = useMemo(() => {
    if (currentPath === ProjectDashboardRoutes.BULK_BED_NIGHTS_NEW_HOUSEHOLD) {
      return 'Back to Bed Nights';
    }
    if (currentPath === ProjectDashboardRoutes.BULK_SERVICE_NEW_HOUSEHOLD) {
      return 'Back to Bulk Services';
    }
    return 'Back to Project Enrollments';
  }, [currentPath]);

  return (
    <>
      <PageTitle title={`Enroll Household in ${project.projectName}`} />
      <ManageHousehold
        projectId={project.id}
        // note: we use BackButton instead of BackButtonLink because it uses navigate(-1) and we need to preserve serach params from the previous page
        //
        // TODO: would be nice to pre-fill search param that brings up the household members that were added, but that would require adding the ability to search for clients by household ID
        BackButton={<BackButton>{buttonText}</BackButton>}
      />
    </>
  );
};
export default CreateHouseholdPage;
