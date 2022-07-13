import { useQuery } from '@apollo/client';
import { Paper, Switch, FormGroup, FormControlLabel } from '@mui/material';
import { useState } from 'react';

import ClientCard from './ClientCard';
import SearchResultsTable from './SearchResultsTable';

import { GET_CLIENTS } from '@/api/clients.gql';
import Loading from '@/components/elements/Loading';

interface Props {
  variables: Record<string, any>; // FIXME code-gen
}

const SearchResults: React.FC<Props> = ({ variables }) => {
  const { data, loading, error } = useQuery<{ clients: Client[] }>(
    GET_CLIENTS,
    { variables }
  );
  const [cards, setCards] = useState(false);

  if (loading) return <Loading />;
  if (error) return <Paper sx={{ p: 2 }}>{error.message}</Paper>;

  const rows = data?.clients || [];
  // if data.totalCount > 25, show table

  return (
    <>
      <FormGroup>
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
        rows.map((client) => <ClientCard key={client.id} client={client} />)
      ) : (
        <SearchResultsTable rows={rows} />
      )}
    </>
  );
};
export default SearchResults;
