import BackButtonLink from '@/components/elements/BackButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ManageHousehold from '@/modules/household/components/ManageHousehold';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

const EditHousehold = () => {
  const { enrollment } = useEnrollmentDashboardContext();

  const { clientId, enrollmentId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
  };

  if (!enrollment) return <NotFound />;

  return (
    <>
      <PageTitle title='Edit Household' />

      <ManageHousehold
        householdId={enrollment.householdId}
        projectId={enrollment.project.id}
        BackButton={
          <BackButtonLink
            to={generateSafePath(EnrollmentDashboardRoutes.HOUSEHOLD, {
              clientId,
              enrollmentId,
            })}
          >
            Back to Enrollment
          </BackButtonLink>
        }
      />
    </>
  );
};
export default EditHousehold;
