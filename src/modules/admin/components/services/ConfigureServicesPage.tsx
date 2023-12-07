import { Paper } from '@mui/material';
import ServiceCategoryTable from './ServiceCategoryTable';
import PageTitle from '@/components/layout/PageTitle';

const ConfigureServicesPage = () => (
  <>
    <PageTitle title='Service Categories' />
    <Paper>
      <ServiceCategoryTable />
    </Paper>
  </>
);

export default ConfigureServicesPage;
