import { useCallback } from 'react';
import { To, useLocation, useNavigate } from 'react-router-dom';
import ManageHousehold from './ManageHousehold';
import BackButton from '@/components/elements/BackButton';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useCurrentPath from '@/hooks/useCurrentPath';
import useSafeParams from '@/hooks/useSafeParams';
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
  return 'Back to Project';
}

const CreateHouseholdPage = () => {
  const { project } = useProjectDashboardContext();
  const currentPath = useCurrentPath();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { householdId } = useSafeParams();

  const renderBackButton = useCallback(
    (hhId?: string) => (
      <BackButton
        onClick={() => {
          if (!state?.prev) {
            navigate(-1);
          } else if (hhId) {
            // If previous path was specified and a household was created,
            // inject household query as `searchTerm` (bed nights workflow)
            const path = injectSearchParams(state.prev, {
              searchTerm: `household:${hhId}`,
            });
            navigate(path as To);
          } else {
            navigate(state.prev);
          }
        }}
      >
        {buttonTextForPath(currentPath)}
      </BackButton>
    ),
    [currentPath, navigate, state.prev]
  );

  if (!project.access.canEnrollClients || !project.access.canEditEnrollments) {
    return <NotFound />;
  }

  return (
    <>
      <PageTitle title={`Enroll Household in ${project.projectName}`} />
      <ManageHousehold
        project={project}
        householdId={householdId}
        canEdit={true}
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
          // TODO: tests with back to bulk services / bed nights
        }}
        renderBackButton={renderBackButton}
      />
    </>
  );
};
export default CreateHouseholdPage;
