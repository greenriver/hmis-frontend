import {
  Button,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useParams, generatePath, Link as RouterLink } from 'react-router-dom';

import Breadcrumbs from '../elements/Breadcrumbs';
import PageHeader from '../layout/PageHeader';

import { Routes } from '@/routes/routes';

const Project = () => {
  const { id } = useParams() as {
    id: string;
  };

  const crumbs = [
    {
      label: 'All Projects',
      to: Routes.ALL_PROJECTS,
    },
    {
      label: 'Organization',
      to: Routes.ORGANIZATION,
    },
    { label: `Project ${id}`, to: Routes.PROJECT },
  ];

  return (
    <>
      <PageHeader>
        <Typography variant='h5'>Projects</Typography>
      </PageHeader>
      <Container maxWidth='lg' sx={{ pt: 3, pb: 6 }}>
        <Breadcrumbs crumbs={crumbs} />
        <Grid container spacing={4}>
          <Grid item xs={9}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Project Details
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Stack spacing={2}>
                <Typography variant='h6'>Add to Project</Typography>
                <Button
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  component={RouterLink}
                  to=''
                >
                  + Add Inventory
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  component={RouterLink}
                  to=''
                >
                  + Add Funding Source
                </Button>
                <Button
                  variant='outlined'
                  color='secondary'
                  sx={{ pl: 3, justifyContent: 'left' }}
                  component={RouterLink}
                  to=''
                >
                  + Add Project CoC
                </Button>
              </Stack>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Link
                  component={RouterLink}
                  to={generatePath(Routes.EDIT_PROJECT, {
                    id,
                  })}
                >
                  Edit Project
                </Link>
                <Link component={RouterLink} to=''>
                  Delete Project
                </Link>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
export default Project;
