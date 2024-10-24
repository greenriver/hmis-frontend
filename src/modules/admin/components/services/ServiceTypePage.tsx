import { Paper } from '@mui/material';
import ServiceTypeTable from './ServiceTypeTable';
import PageTitle from '@/components/layout/PageTitle';
import NewServiceTypeButton from '@/modules/admin/components/services/NewServiceTypeButton';

const ServiceTypePage = () => {
  return (
    <>
      <PageTitle title='Service Types' actions={<NewServiceTypeButton />} />
      <Paper>
        <ServiceTypeTable />
      </Paper>
    </>
  );
};

export default ServiceTypePage;
