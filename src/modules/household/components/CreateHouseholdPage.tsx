import { useCallback, useMemo } from 'react';
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

const supportedPaths = [
  // each path should have optional householdId token
  ProjectDashboardRoutes.BULK_BED_NIGHTS_NEW_HOUSEHOLD,
  ProjectDashboardRoutes.BULK_SERVICE_NEW_HOUSEHOLD,
  ProjectDashboardRoutes.ADD_HOUSEHOLD,
];

/**
 * Page for creating a new household.
 * This is used for enrolling a new household in a project, including during the bulk services and bed nights workflows.
 *
 *
 *
 * Back button has special logic for Bulk Services and Bed Nights household creation. To test:
 * 1. Go to bulk services
 * 2. Select date and service (they will be added to url)
 * 3. Perform Search
 * 4. Click "Add Household"
 * 5. Add household member
 * 6. Click "Back to Bulk Services".
 *   It should return to service assignment with correct date and service type
 *   selected, AND auto-fill the search box with the newly added household ID.
 */
const CreateHouseholdPage = () => {
  const { project } = useProjectDashboardContext();
  const currentPath = useCurrentPath();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { householdId } = useSafeParams();

  const currentRoute = useMemo(() => {
    if (!currentPath) return;
    return supportedPaths.find((path) => path === currentPath);
  }, [currentPath]);

  // When first member is added to household, replace path with :householdId token added
  const onFirstMemberAdded = useCallback(
    (householdId: string) => {
      if (!currentRoute) return;

      const newPath = generateSafePath(currentRoute, {
        projectId: project.id,
        householdId,
      });
      navigate(newPath, { replace: true, state });
    },
    [currentRoute, navigate, project.id, state]
  );

  const onGoBack = useCallback(() => {
    if (!state?.prev) {
      navigate(-1);
    } else if (householdId) {
      const path = injectSearchParams(state.prev, {
        searchTerm: `household:${householdId}`,
      });
      navigate(path as To);
    } else {
      navigate(state.prev);
    }
  }, [householdId, navigate, state?.prev]);

  if (!currentRoute) return <NotFound />;

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
        onFirstMemberAdded={onFirstMemberAdded}
        BackButton={
          <BackButton onClick={onGoBack}>
            {buttonTextForPath(currentRoute)}
          </BackButton>
        }
      />
    </>
  );
};
export default CreateHouseholdPage;
