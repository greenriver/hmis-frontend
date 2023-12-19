import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';
// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router-dom';
import FormRuleTable from '../formRules/FormRuleTable';
import FormTypeChip from './FormTypeChip';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import {
  CreateFormRuleDocument,
  CreateFormRuleMutation,
  FormRuleInput,
  MutationCreateFormRuleArgs,
  StaticFormRole,
  useGetFormDefinitionByIdQuery,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

const ViewFormDefinitionPage = () => {
  const { formId } = useParams() as { formId: string };

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionByIdQuery({
      variables: { id: formId },
    });

  // Form dialog for adding a new rules
  const { openFormDialog, renderFormDialog } = useStaticFormDialog<
    CreateFormRuleMutation,
    MutationCreateFormRuleArgs
  >({
    formRole: StaticFormRole.FormRule,
    // initialValues: selectedRule,
    mutationDocument: CreateFormRuleDocument,
    getErrors: (data) => data.createFormRule?.errors || [],
    getVariables: (values) => ({
      input: { input: values as FormRuleInput, definitionId: formId },
    }),
    onCompleted: () => evictQuery('formRules'),
  });

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <PageTitle
        title={formDefinition?.title}
        actions={<FormTypeChip role={formDefinition.role} />}
      />

      <TitleCard
        title='Form Rules'
        headerVariant='border'
        actions={
          <Button
            onClick={() => openFormDialog()}
            startIcon={<AddIcon />}
            variant='outlined'
          >
            New Rule
          </Button>
        }
      >
        <FormRuleTable queryVariables={{ filters: { definition: formId } }} />
      </TitleCard>
      {renderFormDialog({
        title: <span>New Rule for {formDefinition.title}</span>,
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};

export default ViewFormDefinitionPage;
