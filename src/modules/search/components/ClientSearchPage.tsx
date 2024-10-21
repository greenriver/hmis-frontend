import PageContainer from '@/components/layout/PageContainer';
import ClientSearch from '@/modules/search/components/ClientSearch';

const ClientSearchPage = () => {
  return (
    <PageContainer title='Clients'>
      <ClientSearch />
    </PageContainer>
  );
};

export default ClientSearchPage;
