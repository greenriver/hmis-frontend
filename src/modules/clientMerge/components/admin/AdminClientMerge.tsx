import { Paper } from '@mui/material';
import ClientMergeCandidatesTable from './ClientMergeCandidatesTable';
import PageTitle from '@/components/layout/PageTitle';

const AdminClientMerge: React.FC = () => {
  return (
    <>
      <PageTitle title='Merge Clients' />
      <Paper>
        <ClientMergeCandidatesTable />
      </Paper>
    </>
  );
};

export default AdminClientMerge;
