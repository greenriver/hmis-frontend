import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';

import FormRuleTable from '../formRules/FormRuleTable';
import TitleCard from '@/components/elements/TitleCard';
import FormProjectMatchTable from '@/modules/admin/components/formRules/FormProjectMatchTable';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import {
  CreateFormRuleDocument,
  CreateFormRuleMutation,
  FormRole,
  FormRuleInput,
  MutationCreateFormRuleArgs,
  StaticFormRole,
  useGetFormProjectMatchesQuery,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

interface Props {
  formId: string;
  formTitle: string;
  formRole: FormRole;
}
const FormRulesCard: React.FC<Props> = ({ formTitle, formId, formRole }) => {
  // Form dialog for adding new rules
  const { openFormDialog, renderFormDialog } = useStaticFormDialog<
    CreateFormRuleMutation,
    MutationCreateFormRuleArgs
  >({
    formRole: StaticFormRole.FormRule,
    mutationDocument: CreateFormRuleDocument,
    localConstants: { formRole },
    getErrors: (data) => data.createFormRule?.errors || [],
    getVariables: (values) => ({
      input: { input: values as FormRuleInput, definitionId: formId },
    }),
    onCompleted: () => {
      evictQuery('formDefinition', { id: formId });
      evictQuery('formRules');
    },
  });

  // Fetch here in order to display the total number of project matches outside of the table.
  // FormProjectMatchTable also requests this, so it will fetch from the apollo cache.
  const { data: fetchFormData } = useGetFormProjectMatchesQuery({
    variables: { id: formId },
  });
  const matchCount = fetchFormData?.formDefinition?.projectMatches.nodesCount;

  return (
    <>
      <TitleCard
        title='Form Applicability'
        headerTypographyVariant='h4'
        headerComponent='h2'
        actions={
          <Stack direction='row' gap={1}>
            <Button
              onClick={() => openFormDialog()}
              startIcon={<AddIcon />}
              variant='outlined'
            >
              New Rule
            </Button>
          </Stack>
        }
      >
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant='h5' component='h3' sx={{ pb: 1 }}>
            Rules
          </Typography>
          <Typography variant='body1'>
            This form applies to projects that match any of the following rules.
          </Typography>
        </Box>
        <Divider sx={{ borderWidth: 'inherit' }} />
        <FormRuleTable formId={formId} formRole={formRole} />
        <Box padding={2}>
          <Typography variant='h5' component='h3' sx={{ pb: 1 }}>
            Projects
          </Typography>
          <Typography variant='body1'>
            This form applies to the following{' '}
            {matchCount ? matchCount + ' ' : ''}
            projects based on the current rules.
          </Typography>
        </Box>
        <FormProjectMatchTable formId={formId} />
      </TitleCard>
      {renderFormDialog({
        title: (
          <span>
            New rule for Form: <b>{formTitle}</b>
          </span>
        ),
      })}
    </>
  );
};

export default FormRulesCard;
