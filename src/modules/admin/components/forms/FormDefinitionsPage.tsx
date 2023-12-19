import { Paper } from '@mui/material';
import FormDefinitionTable from './FormDefinitionTable';
import PageTitle from '@/components/layout/PageTitle';

const FormDefinitionsPage = () => {
  return (
    <>
      <PageTitle title='Forms' />
      <Paper>
        <FormDefinitionTable />
      </Paper>
    </>
  );
};

export default FormDefinitionsPage;
