import { Grid, Paper } from '@mui/material';
import { useCallback } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useNavigate } from 'react-router-dom';
import PageTitle from '@/components/layout/PageTitle';
import StaticForm from '@/modules/form/components/StaticForm';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  CreateFormRuleDocument,
  CreateFormRuleMutation,
  FormRuleInput,
  MutationCreateFormRuleArgs,
  StaticFormRole,
} from '@/types/gqlTypes';

const CreateFormRulePage = () => {
  const navigate = useNavigate();
  const onCompleted = useCallback(
    (data: CreateFormRuleMutation) => {
      if (!data.createFormRule) return;
      if (data.createFormRule.errors.length > 0) return;

      navigate(AdminDashboardRoutes.FORMS);
    },
    [navigate]
  );
  // definition would already be specified, as would the form rule

  return (
    <>
      <PageTitle title='New Form Rule' />
      <Grid container>
        <Grid item xs={12} md={12} lg={8}>
          <Paper sx={{ p: 4 }}>
            {/* <Stack gap={2} sx={{ mb: 4 }}>
              <CommonLabeledTextBlock title='Form Definition Title'>
                {formRule.definitionTitle}
              </CommonLabeledTextBlock>
              <CommonLabeledTextBlock title='Form Type'>
                {formRule.definitionRole &&
                  HmisEnums.FormRole[formRule.definitionRole]}
              </CommonLabeledTextBlock>
            </Stack> */}
            {/* <Typography variant='h5' sx={{ mb: 2 }}>
              Project Applicability Rules
            </Typography> */}
            <StaticForm<CreateFormRuleMutation, MutationCreateFormRuleArgs>
              // initialValues={formRule}
              mutationDocument={CreateFormRuleDocument}
              getErrors={(data) => data.createFormRule?.errors || []}
              getVariables={(values) => ({
                // FIXME - modal and take def id from context
                input: { input: values as FormRuleInput, definitionId: '2' },
              })}
              onCompleted={onCompleted}
              role={StaticFormRole.FormRule}
            />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateFormRulePage;
