import { Paper } from '@mui/material';
import FormRuleTable from './FormRuleTable';
import PageTitle from '@/components/layout/PageTitle';

const FormRulesPage = () => {
  return (
    <>
      <PageTitle title='Form Rules' />
      <Paper>
        <FormRuleTable />
      </Paper>
    </>
  );
};
export default FormRulesPage;
