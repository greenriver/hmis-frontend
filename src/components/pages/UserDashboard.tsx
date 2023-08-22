import PageContainer from '../layout/PageContainer';
import ClientSearch from '@/modules/search/components/ClientSearch';

const UserDashboard = () => {
  return (
    <PageContainer title='Clients'>
      <ClientSearch />
    </PageContainer>
  );
};

export default UserDashboard;
