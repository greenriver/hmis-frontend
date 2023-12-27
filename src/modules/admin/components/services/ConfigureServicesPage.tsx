import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';
import ServiceCategoryTable from './ServiceCategoryTable';
import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';

const ConfigureServicesPage = () => (
  <>
    <PageTitle
      title='Service Categories'
      actions={
        <ButtonLink to='' Icon={AddIcon}>
          New Category
        </ButtonLink>
      }
    />
    <Paper>
      <ServiceCategoryTable />
    </Paper>
  </>
);

export default ConfigureServicesPage;
