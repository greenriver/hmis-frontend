import { Paper, Stack } from '@mui/material';
import ClientMergeCandidatesTable from './ClientMergeCandidatesTable';
import BackButton from '@/components/elements/BackButton';
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

        <BackButton to={AdminDashboardRoutes.CLIENT_MERGE_HISTORY}>
          Back to Merge History
        </BackButton>
      </Stack>
    </>
  );
};

export default AdminClientMerge;
