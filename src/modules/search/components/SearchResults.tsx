import { useQuery } from '@apollo/client';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import {
  Paper,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Button,
  Box,
  Card,
  Stack,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

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
      <Grid container justifyContent='space-between' sx={{ mb: 4 }}>
        <Grid item>
          <ToggleButtonGroup
            value={cards}
            exclusive
            onChange={(_, checked: boolean) => setCards(checked)}
            aria-label='results display format'
          >
            <ToggleButton value={false} aria-label='table' size='small'>
              <ViewHeadlineIcon />
              <Box sx={{ pl: 0.5 }}>Table</Box>
            </ToggleButton>
            <ToggleButton value={true} aria-label='cards' size='small'>
              <ViewCompactIcon />
              <Box sx={{ pl: 0.5 }}>Cards</Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item>
          <Card sx={{ p: 1 }}>
            <Stack direction='row' spacing={3}>
              <Typography>Don't see the client you're looking for?</Typography>
              <Button
                size='small'
                variant='outlined'
                component={RouterLink}
                to='/intake'
              >
                + Add Client
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
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
