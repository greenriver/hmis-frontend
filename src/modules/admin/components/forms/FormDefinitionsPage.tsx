import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormDefinitionTable, { Row } from './FormDefinitionTable';
import PageTitle from '@/components/layout/PageTitle';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  CreateFormDefinitionDocument,
  CreateFormDefinitionMutation,
  FormDefinitionInput,
  MutationCreateFormDefinitionArgs,
  MutationUpdateFormDefinitionArgs,
  StaticFormRole,
  UpdateFormDefinitionDocument,
  UpdateFormDefinitionMutation,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

const FormDefinitionsPage = () => {
  const [selected, setSelected] = useState<Row>();
  const navigate = useNavigate();
  // Dialog for updating form definitions
  const { openFormDialog: openEditDialog, renderFormDialog: renderEditDialog } =
    useStaticFormDialog<
      UpdateFormDefinitionMutation,
      MutationUpdateFormDefinitionArgs
    >({
      formRole: StaticFormRole.FormDefinition,
      initialValues: selected,
      mutationDocument: UpdateFormDefinitionDocument,
      getErrors: (data) => data.updateFormDefinition?.errors || [],
      getVariables: (values) => ({
        input: values as FormDefinitionInput,
        id: selected?.id || '',
      }),
      onCompleted: () => {},
      onClose: () => setSelected(undefined),
    });
  // Dialog for creating new form definitions
  const {
    openFormDialog: openCreateDialog,
    renderFormDialog: renderCreateDialog,
  } = useStaticFormDialog<
    CreateFormDefinitionMutation,
    MutationCreateFormDefinitionArgs
  >({
    formRole: StaticFormRole.FormDefinition,
    mutationDocument: CreateFormDefinitionDocument,
    getErrors: (data) => data.createFormDefinition?.errors || [],
    getVariables: (values) => ({ input: values as FormDefinitionInput }),
    onCompleted: (data) => {
      const id = data?.createFormDefinition?.formDefinition?.id;
      evictQuery('formDefinitions');
      if (id)
        navigate(
          generateSafePath(AdminDashboardRoutes.VIEW_FORM, { formId: id })
        );
    },
    onClose: () => setSelected(undefined),
  });
  return (
    <>
      <PageTitle
        title='Forms'
        actions={
          <Button
            startIcon={<AddIcon />}
            variant='outlined'
            onClick={() => openCreateDialog()}
          >
            New Definition
          </Button>
        }
      />
      <Paper>
        <FormDefinitionTable
          onSelect={(vals) => {
            setSelected(vals);
            openEditDialog();
          }}
        />
      </Paper>
      {renderCreateDialog({ title: 'New Form Definition' })}
      {renderEditDialog({ title: 'Update Form Definition' })}
    </>
  );
};

export default FormDefinitionsPage;
