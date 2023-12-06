import { Paper } from '@mui/material';
import FormRulesTable from './FormRulesTable';
import PageTitle from '@/components/layout/PageTitle';

const FormRulesPage = () => {
  return (
    <>
      <PageTitle title='Form Rules' />
      <Paper>
        <FormRulesTable />
      </Paper>
    </>
  );
};
export default FormRulesPage;
