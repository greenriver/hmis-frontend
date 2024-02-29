import AddIcon from '@mui/icons-material/Add';
import { Button, Grid, Paper } from '@mui/material';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import FormDefinitionTable from './FormDefinitionTable';
import PageTitle from '@/components/layout/PageTitle';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  CreateFormDefinitionDocument,
  CreateFormDefinitionMutation,
  FormDefinitionInput,
  MutationCreateFormDefinitionArgs,
  StaticFormRole,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';

const FormDefinitionsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState<string>('');

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
        navigate(generatePath(AdminDashboardRoutes.VIEW_FORM, { formId: id }));
    },
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
            New Form
          </Button>
        }
      />
      <Grid container gap={2}>
        <Grid item xs={12} xl={6}>
          <CommonSearchInput
            label='Search forms'
            name='searchForms'
            placeholder='Search forms by title'
            value={search}
            onChange={setSearch}
            searchAdornment
          />
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <FormDefinitionTable />
          </Paper>
        </Grid>
      </Grid>
      {renderCreateDialog({ title: 'New Form Definition' })}
    </>
  );
};

export default FormDefinitionsPage;
