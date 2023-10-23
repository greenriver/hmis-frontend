import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import PageTitle from '@/components/layout/PageTitle';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ManageHousehold from '@/modules/household/components/ManageHousehold';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const EditHousehold = () => {
  const navigate = useNavigate();
  const { enrollment } = useEnrollmentDashboardContext();

  const { clientId, enrollmentId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
  };

  const navigateToEnrollment = useMemo(
    () => () =>
      navigate(
        generateSafePath(EnrollmentDashboardRoutes.HOUSEHOLD, {
          clientId,
          enrollmentId,
        })
      ),
    [clientId, enrollmentId, navigate]
  );

  if (!enrollment) return <NotFound />;

  return (
    <>
      <PageTitle title='Edit Household' />

      <ManageHousehold
        householdId={enrollment.householdId}
        projectId={enrollment.project.id}
        BackButton={
          <Button
            startIcon={<ArrowBackIcon />}
            variant='gray'
            size='small'
            sx={{ width: 'fit-content' }}
            onClick={navigateToEnrollment}
          >
            Back to Enrollment
          </Button>
        }
      />
    </>
  );
};
export default EditHousehold;
