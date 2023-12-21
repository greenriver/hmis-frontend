import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Stack } from '@mui/material';
// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router-dom';
import FormRuleTable from '../formRules/FormRuleTable';
import ButtonLink from '@/components/elements/ButtonLink';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import PageTitle from '@/components/layout/PageTitle';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  CreateFormRuleDocument,
  CreateFormRuleMutation,
  FormRuleInput,
  MutationCreateFormRuleArgs,
  StaticFormRole,
  useGetFormDefinitionByIdQuery,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

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
        actions={
          <ButtonLink
            to={generateSafePath(AdminDashboardRoutes.EDIT_FORM, { formId })}
            startIcon={<EditIcon />}
            variant='outlined'
          >
            Edit Definition
          </ButtonLink>
        }
      />

      <TitleCard
        title='Form Rules'
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
