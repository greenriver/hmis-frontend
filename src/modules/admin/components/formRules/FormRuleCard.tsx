import AddIcon from '@mui/icons-material/Add';
import { Button, Stack } from '@mui/material';

import FormRuleTable from '../formRules/FormRuleTable';
import TitleCard from '@/components/elements/TitleCard';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import {
  CreateFormRuleDocument,
  CreateFormRuleMutation,
  FormRole,
  FormRuleInput,
  MutationCreateFormRuleArgs,
  StaticFormRole,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

interface Props {
  formId: string;
  formTitle: string;
  formRole: FormRole;
}
const FormRuleCard: React.FC<Props> = ({ formTitle, formId, formRole }) => {
  // Form dialog for adding new rules
  const { openFormDialog, renderFormDialog } = useStaticFormDialog<
    CreateFormRuleMutation,
    MutationCreateFormRuleArgs
  >({
    formRole: StaticFormRole.FormRule,
    mutationDocument: CreateFormRuleDocument,
    getErrors: (data) => data.createFormRule?.errors || [],
    getVariables: (values) => ({
      input: { input: values as FormRuleInput, definitionId: formId },
    }),
    onCompleted: () => evictQuery('formRules'),
  });

  return (
    <>
      <TitleCard
        title='Form Rules (rules that dictate where this form is used)'
        headerVariant='border'
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
        <FormRuleTable
          queryVariables={{ filters: { definition: formId } }}
          formRole={formRole}
        />
      </TitleCard>
      {renderFormDialog({
        title: <span>New rule for {formTitle}</span>,
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};

export default FormRuleCard;
