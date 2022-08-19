import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink, generatePath } from 'react-router-dom';

// import AssessmentsTable from '../tables/AssessmentsTable';

import { DashboardRoutes } from '@/routes/routes';

const AssessmentsPanel = ({
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
}) => {
  return (
    <Stack>
      <Stack sx={{ mb: 2, alignItems: 'center' }} direction='row' gap={3}>
        <Typography variant='h5'>Assessments</Typography>
        <Button
          variant='outlined'
          color='secondary'
          component={RouterLink}
          size='small'
          to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
            clientId,
            enrollmentId,
            assessmentType: 'TODO',
          })}
        >
          + Add Assessment
        </Button>
      </Stack>
      {/* FIXME: add back when query works */}
      {/* <AssessmentsTable clientId={clientId} enrollmentId={enrollmentId} /> */}
    </Stack>
  );
};

export default AssessmentsPanel;
