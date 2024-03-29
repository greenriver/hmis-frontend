import { Paper, Stack } from '@mui/material';
import ClientMergeCandidatesTable from './ClientMergeCandidatesTable';
import BackButtonLink from '@/components/elements/BackButtonLink';
import PageTitle from '@/components/layout/PageTitle';
import { AdminDashboardRoutes } from '@/routes/routes';

const AdminClientMerge: React.FC = () => {
  return (
    <>
      <PageTitle title='Potential Duplicates' />
      <Stack gap={2}>
        <Paper>
          <ClientMergeCandidatesTable />
        </Paper>

        <BackButtonLink to={AdminDashboardRoutes.CLIENT_MERGE_HISTORY}>
          Back to Merge History
        </BackButtonLink>
      </Stack>
    </>
  );
};

export default AdminClientMerge;
