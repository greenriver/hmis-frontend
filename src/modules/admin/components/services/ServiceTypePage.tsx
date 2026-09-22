import { Grid, Paper } from '@mui/material';
import ServiceTypeTable from './ServiceTypeTable';
import PageTitle from '@/components/layout/PageTitle';
import useDebouncedState from '@/hooks/useDebouncedState';
import NewServiceTypeButton from '@/modules/admin/components/services/NewServiceTypeButton';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';

const ServiceTypePage = () => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  return (
    <>
      <PageTitle title='Service Types' actions={<NewServiceTypeButton />} />
      <Grid container gap={2}>
        <Grid item xs={12}>
          <CommonSearchInput
            label='Search service types'
            size='medium'
            name='searchServiceTypes'
            placeholder='Search service types'
            value={search}
            onChange={setSearch}
            searchAdornment
          />
        </Grid>
        <Grid item xs={12}>
          <Paper>
            <ServiceTypeTable searchTerm={debouncedSearch || undefined} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ServiceTypePage;
