import { useQuery } from '@apollo/client';
import { Paper, Switch, FormGroup, FormControlLabel } from '@mui/material';
import { useEffect, useState } from 'react';

import ClientCard from './ClientCard';
import SearchResultsTable from './SearchResultsTable';

import { GET_CLIENTS } from '@/api/clients.gql';
import Loading from '@/components/elements/Loading';
import Pagination from '@/components/elements/Pagination';

const PAGE_SIZE = 3;
const MAX_CARDS_THRESHOLD = 100;

// FIXME code-gen
interface Props {
  filters: Record<string, any>;
}

// FIXME code-gen
interface ClientQuery {
  totalCount: number;
  offset: number;
  limit: number;
  nodes: Client[];
}

const SearchResults: React.FC<Props> = ({ filters }) => {
  const [cards, setCards] = useState<boolean>();
  const [offset, setOffset] = useState(0);

  const limit = PAGE_SIZE;
  const { data, loading, error, fetchMore } = useQuery<ClientQuery>(
    GET_CLIENTS,
    {
      variables: {
        input: filters,
        limit,
        offset: 0,
      },
      onCompleted: () => {
        console.log('query completed!');
      },
    }
  );

  // Set initial state of Card/Table toggle
  useEffect(() => {
    if (typeof cards === 'undefined' && data) {
      setCards(data.totalCount <= MAX_CARDS_THRESHOLD);
    }
  }, [data, cards]);

  // Fetch more data on page change
  useEffect(() => {
    void fetchMore({
      variables: { offset },
    });
  }, [offset, fetchMore]);

  if (error) return <Paper sx={{ p: 2 }}>{error.message}</Paper>;

  // workaround: render loading if card toggle isn't set yet, because useEffect stil needs to run to set the initial card state
  if (loading || !data || typeof cards === 'undefined') return <Loading />;

  return (
    <>
      <FormGroup sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={cards}
              onChange={(_, checked) => setCards(checked)}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          }
          label={cards ? 'Switch to table' : 'Switch to cards'}
        />
      </FormGroup>
      {cards ? (
        data.nodes.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))
      ) : (
        <SearchResultsTable rows={data.nodes} />
      )}
      <Pagination
        {...{ limit, offset }}
        totalEntries={data.totalCount}
        setOffset={setOffset}
        itemName='clients'
        gridProps={{ mt: 2 }}
      />
    </>
  );
};
export default SearchResults;
