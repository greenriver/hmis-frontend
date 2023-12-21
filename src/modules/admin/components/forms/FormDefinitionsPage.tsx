import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';
import { useState } from 'react';
import FormDefinitionTable, { Row } from './FormDefinitionTable';
import PageTitle from '@/components/layout/PageTitle';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
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

const FormDefinitionsPage = () => {
  const [selected, setSelected] = useState<Row>();
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
    onCompleted: () => {},
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
