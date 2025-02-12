import { To, useLocation, useNavigate, useParams } from 'react-router-dom';
import ManageHousehold from './ManageHousehold';
import BackButton from '@/components/elements/BackButton';
import PageTitle from '@/components/layout/PageTitle';
import useCurrentPath from '@/hooks/useCurrentPath';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { injectSearchParams } from '@/routes/routeUtil';
import { generateSafePath } from '@/utils/pathEncoding';

function buttonTextForPath(path?: string) {
  if (path === ProjectDashboardRoutes.BULK_BED_NIGHTS_NEW_HOUSEHOLD) {
    return 'Back to Bed Nights';
  }
  if (path === ProjectDashboardRoutes.BULK_SERVICE_NEW_HOUSEHOLD) {
    return 'Back to Bulk Services';
  }
  return 'Back to Project Enrollments';
}

const CreateHouseholdPage = () => {
  const { project } = useProjectDashboardContext();
  const currentPath = useCurrentPath();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { householdId } = useParams();

  console.log('currentPath', currentPath, 'householdId', householdId);
  return (
    <>
      <PageTitle title={`Enroll Household in ${project.projectName}`} />
      <ManageHousehold
        project={project}
        householdId={householdId}
        onFirstMemberAdded={(householdId: string) => {
          if (ProjectDashboardRoutes.ADD_HOUSEHOLD === currentPath) {
            navigate(
              generateSafePath(ProjectDashboardRoutes.ADD_HOUSEHOLD, {
                projectId: project.id,
                householdId,
              }),
              { replace: true }
            );
          }
        }}
        renderBackButton={(householdId) => (
          <BackButton
            onClick={() => {
              if (!state?.prev) {
                navigate(-1);
              } else if (householdId) {
                // If previous path was specified and a household was created,
                // inject household query as `searchTerm`
                const path = injectSearchParams(state.prev, {
                  searchTerm: `household:${householdId}`,
                });
                navigate(path as To);
              } else {
                navigate(state.prev);
              }
            }}
          >
            {buttonTextForPath(currentPath)}
          </BackButton>
        )}
      />
    </>
  );
};
export default CreateHouseholdPage;
