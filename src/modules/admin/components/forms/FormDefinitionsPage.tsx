import { Paper } from '@mui/material';
import FormDefinitionTable from './FormDefinitionTable';
import PageTitle from '@/components/layout/PageTitle';

const FormDefinitionsPage = () => {
  return (
    <>
      <PageTitle
        title='Forms'
        // actions={
        //   <ButtonLink to={AdminDashboardRoutes.ADD_FORM_RULE} Icon={AddIcon}>
        //     New Form
        //   </ButtonLink>
        // }
      />
      <Paper>
        <FormDefinitionTable />
      </Paper>
      {/* <Paper>
        <FormRuleTable onRowClick={handleClick} />
      </Paper> */}
    </>
  );
};

export default FormDefinitionsPage;
