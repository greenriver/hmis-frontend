import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Button, Grid, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
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
      <Grid container spacing={4} sx={{ pb: 10 }}>
        <Grid item xs={12}>
          <Typography variant='h4' sx={{ mb: 2 }}>
            Edit Household
            <Box component='span' fontWeight={400}>
              {` for ${enrollmentName(enrollment)} `} enrollment
            </Box>
          </Typography>
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
        </Grid>
      </Grid>
    </>
  );
};
export default EditHousehold;
