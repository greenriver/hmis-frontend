import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import FormRuleTable from './FormRuleTable';
import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { AdminDashboardRoutes } from '@/routes/routes';
import { FormRuleFieldsFragment } from '@/types/gqlTypes';

const FormRulesPage = () => {
  const navigate = useNavigate();
  const handleClick = useCallback(
    (row: FormRuleFieldsFragment) =>
      navigate(
        generatePath(AdminDashboardRoutes.EDIT_FORM_RULE, {
          formRuleId: row.id,
        })
      ),
    [navigate]
  );

  return (
    <>
      <PageTitle
        title='Form Rules'
        actions={
          <ButtonLink to={AdminDashboardRoutes.ADD_FORM_RULE} Icon={AddIcon}>
            New Rule
          </ButtonLink>
        }
      />
      <Paper>
        <FormRuleTable onRowClick={handleClick} />
      </Paper>
    </>
  );
};

export default FormRulesPage;
