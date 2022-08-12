import { Grid, Typography } from '@mui/material';
import { useLocation, useOutletContext, useParams } from 'react-router-dom';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import DynamicForm from '@/modules/form/components/DynamicForm';
import formData from '@/modules/form/data/assessment.json';
import { FormDefinition } from '@/modules/form/types';
import { DashboardRoutes } from '@/routes/routes';
import { Client } from '@/types/gqlTypes';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const intakeFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const NewAssessment = () => {
  const { pathname } = useLocation();
  // FIXME put enrollment in context, and fetch formDefinition here based on
  // enrollment/project ID
  const { enrollmentId } = useParams() as { enrollmentId: string };
  const { client } = useOutletContext<{ client: Client | null }>();
  if (!client) throw Error('Missing client');

  //FIXME pull out into router state?
  const crumbs = [
    {
      label: 'Back to all enrollments',
      to: DashboardRoutes.ALL_ENROLLMENTS,
    },
    {
      label: `Enrollment ${enrollmentId}`,
      to: DashboardRoutes.VIEW_ENROLLMENT,
    },
    {
      label: `Intake Assessment`,
      to: pathname,
    },
  ];
  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Grid container spacing={4}>
        <Grid item xs={9}>
          <Typography variant='h5'>Intake Assessment</Typography>
          <DynamicForm
            definition={intakeFormDefinition}
            onSubmit={(values) => console.log(values)}
            // submitButtonText='Create Record'
            // discardButtonText='Cancel'
          />
        </Grid>
        <Grid item xs></Grid>
      </Grid>
    </>
  );
};

export default NewAssessment;
