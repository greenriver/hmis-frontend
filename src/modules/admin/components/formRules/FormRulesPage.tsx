import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';
import FormRuleTable from './FormRuleTable';
import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';

const FormRulesPage = () => (
  <>
    <PageTitle
      title='Form Rules'
      actions={
        <ButtonLink to='' Icon={AddIcon}>
          New Rule
        </ButtonLink>
      }
    />
    <Paper>
      <FormRuleTable />
    </Paper>
  </>
);

export default FormRulesPage;
