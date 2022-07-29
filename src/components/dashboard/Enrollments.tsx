import { Grid, Paper, Typography } from '@mui/material';
import { useNavigate, useOutletContext } from 'react-router-dom';

import GenericTable from '../elements/GenericTable';

import { Client, Enrollment } from '@/types/gqlTypes';

const Enrollments = () => {
  const { client } = useOutletContext<{ client: Client | null }>();
  const navigate = useNavigate();
  if (!client) throw Error('Missing client');

  return (
    <Grid container spacing={4}>
      <Grid item xs={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Enrollments
          </Typography>
          <GenericTable<Enrollment>
            rows={client.enrollments}
            handleRowClick={(enrollment) =>
              navigate(`/client/${client.id}/enrollments/${enrollment.id}`)
            }
            columns={[
              { header: 'ID', render: 'id' },
              { header: 'Project', render: (e) => e.project.projectName },
              { header: 'Start Date', render: 'entryDate' },
              {
                header: 'End Date',
                render: (e) => <>{e.exitDate || 'Active'}</>,
              },
            ]}
          />
        </Paper>
      </Grid>
      <Grid item xs>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Available Projects
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Enrollments;
