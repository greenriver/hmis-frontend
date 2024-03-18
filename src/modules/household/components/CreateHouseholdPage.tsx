import { useNavigate, useSearchParams } from 'react-router-dom';
import ManageHousehold from './ManageHousehold';
import BackButton from '@/components/elements/BackButton';
import PageTitle from '@/components/layout/PageTitle';
import useCurrentPath from '@/hooks/useCurrentPath';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { toPreviousUrlFromSearchParam } from '@/routes/routeUtil';

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
  const [params] = useSearchParams();
  const navigate = useNavigate();

  return (
    <>
      <PageTitle title={`Enroll Household in ${project.projectName}`} />
      <ManageHousehold
        projectId={project.id}
        renderBackButton={(householdId) => (
          <BackButton
            onClick={() => {
              if (!householdId) {
                navigate(-1);
                return;
              }
              // if possible, prefill search query with household id when navigating back
              const backTo = toPreviousUrlFromSearchParam(params, {
                searchTerm: `household:${householdId}`,
              });

              if (backTo) {
                navigate(backTo);
              } else {
                navigate(-1);
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
