import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router-dom';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import StaticForm from '@/modules/form/components/StaticForm';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormRuleInput,
  MutationUpdateFormRuleArgs,
  StaticFormRole,
  UpdateFormRuleDocument,
  UpdateFormRulePayload,
  useGetFormRuleQuery,
} from '@/types/gqlTypes';

const EditFormRulePage = () => {
  const { formRuleId } = useParams() as { formRuleId: string };

  const { data: { formRule } = {}, error } = useGetFormRuleQuery({
    variables: { id: formRuleId },
  });

  const onCompleted = useCallback((data: UpdateFormRulePayload) => {
    console.error('TODO', data);
  }, []);

  if (error) throw error;
  if (!formRule) return <Loading />;

  return (
    <>
      <PageTitle title='Edit Rule' />
      <Grid container>
        <Grid item xs={12} md={12} lg={8}>
          <Paper sx={{ p: 4 }}>
            <Stack gap={2} sx={{ mb: 4 }}>
              <CommonLabeledTextBlock title='Form Definition Title'>
                {formRule.definitionTitle}
              </CommonLabeledTextBlock>
              <CommonLabeledTextBlock title='Form Type'>
                {formRule.definitionRole &&
                  HmisEnums.FormRole[formRule.definitionRole]}
              </CommonLabeledTextBlock>
            </Stack>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Project Applicability Rules
            </Typography>
            <StaticForm<UpdateFormRulePayload, MutationUpdateFormRuleArgs>
              initialValues={formRule}
              mutationDocument={UpdateFormRuleDocument}
              getErrors={(d) => d.errors}
              transformInput={(values) => ({
                input: { input: values as FormRuleInput, id: formRuleId },
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

export default EditFormRulePage;
