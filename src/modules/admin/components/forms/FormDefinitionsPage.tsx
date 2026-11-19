import AddIcon from '@mui/icons-material/Add';
import { Button, Grid, Paper } from '@mui/material';
import { useState } from 'react';
import FormDefinitionDialog from './FormDefinitionDialog';
import FormDefinitionTable from './FormDefinitionTable';
import PageTitle from '@/components/layout/PageTitle';
import useDebouncedState from '@/hooks/useDebouncedState';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';

const FormDefinitionsPage = () => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  return (
    <>
      <PageTitle
        title='Forms'
        actions={
          <RootPermissionsFilter permissions={'canManageForms'}>
            <Button
              startIcon={<AddIcon />}
              variant='outlined'
              onClick={() => setCreateDialogOpen(true)}
            >
              New Form
            </Button>
          </RootPermissionsFilter>
        }
      />
      <Grid container gap={2}>
        <Grid item xs={12}>
          <CommonSearchInput
            label='Search forms'
            size='medium'
            name='searchForms'
            placeholder='Search forms'
            value={search}
            onChange={setSearch}
            searchAdornment
          />
        </Grid>

        <Grid item xs={12}>
          <Paper>
            <FormDefinitionTable
              queryVariables={{
                filters: { searchTerm: debouncedSearch || undefined },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      {createDialogOpen && (
        <FormDefinitionDialog onClose={() => setCreateDialogOpen(false)} />
      )}
    </>
  );
};

export default FormDefinitionsPage;
