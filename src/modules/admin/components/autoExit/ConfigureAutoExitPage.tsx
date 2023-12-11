import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';
import AutoExitTable from './AutoExitTable';
import ButtonLink from '@/components/elements/ButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { AdminDashboardRoutes } from '@/routes/routes';

const ConfigureAutoExitPage = () => (
  <>
    <PageTitle
      title='Auto Exit Configs'
      actions={
        <ButtonLink
          to={AdminDashboardRoutes.CONFIGURE_AUTO_EXIT_CREATE}
          Icon={AddIcon}
        >
          New Auto Exit Config
        </ButtonLink>
      }
    />
    <Paper>
      <AutoExitTable />
    </Paper>
  </>
);

export default ConfigureAutoExitPage;
