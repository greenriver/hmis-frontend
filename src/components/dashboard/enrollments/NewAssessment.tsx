import { Grid, Typography } from '@mui/material';

import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';
import DynamicForm from '@/modules/form/components/DynamicForm';
import formData from '@/modules/form/data/assessment.json';
import { FormDefinition } from '@/modules/form/types';

// FIXME workaround for enum issue
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const intakeFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(formData)
);

const NewAssessment = () => {
  const [crumbs, loading] = useEnrollmentCrumbs('Intake Assessment');

  if (loading) return <Loading />;
  if (!crumbs) throw Error('Enrollment not found');

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
