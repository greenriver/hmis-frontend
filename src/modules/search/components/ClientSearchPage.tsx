import PageContainer from '@/components/layout/PageContainer';
import ClientSearch from '@/modules/search/components/ClientSearch';
import { SearchType } from '@/modules/search/components/ClientSearchTypeToggle';

interface ClientSearchPageProps {
  searchType: SearchType;
}

/**
 * Page wrapper for client search: layout, title, and routing-derived search type
 * (broad vs specific) passed into ClientSearch.
 */
const ClientSearchPage: React.FC<ClientSearchPageProps> = ({ searchType }) => {
  return (
    <PageContainer title='Clients'>
      <ClientSearch
        key={searchType} // force re-mount when search type changes
        searchType={searchType}
      />
    </PageContainer>
  );
};

export default ClientSearchPage;
