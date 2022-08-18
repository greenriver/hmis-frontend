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

import SearchResultsTable from './SearchResultsTable';

import ClientCard from '@/components/elements/ClientCard';
import Loading from '@/components/elements/Loading';
import Pagination from '@/components/elements/Pagination';
import { Routes } from '@/routes/routes';
import { ClientSearchInput, useSearchClientsQuery } from '@/types/gqlTypes';

const PAGE_SIZE = 10;
const MAX_CARDS_THRESHOLD = 10;

const SearchResults = ({ filters }: { filters: ClientSearchInput }) => {
  const [cards, setCards] = useState<boolean>();
  const [offset, setOffset] = useState(0);

  const limit = PAGE_SIZE;
  const {
    data: { clientSearch: data } = {},
    loading,
    error,
  } = useSearchClientsQuery({
    variables: {
      input: filters,
      limit,
      offset,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Set initial state of Card/Table toggle
  useEffect(() => {
    if (typeof cards === 'undefined' && data) {
      setCards(data.nodesCount <= MAX_CARDS_THRESHOLD);
    }
  }, [data, cards]);

  if (error) return <Paper sx={{ p: 2 }}>{error.message}</Paper>;

  // workaround: render loading if card toggle isn't set yet, because useEffect stil needs to run to set the initial card state
  if (loading || !data || typeof cards === 'undefined') return <Loading />;

  const hasResults = !!data.nodes.length;
  return (
    <>
      <Grid container justifyContent='space-between' sx={{ mb: 4 }}>
        <Grid item>
          {hasResults && (
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
          )}
        </Grid>
        <Grid item>
          <Card sx={{ p: 1 }}>
            <Stack direction='row' spacing={3}>
              <Typography>Don't see the client you're looking for?</Typography>
              <Button
                size='small'
                variant='outlined'
                component={RouterLink}
                to={Routes.CREATE_CLIENT}
              >
                + Add Client
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      {!hasResults && <Paper sx={{ mb: 2, p: 2 }}>No clients found.</Paper>}
      {hasResults &&
        (cards ? (
          data.nodes.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              showLinkToRecord
              // TODO re-enable when we have data for it
              // showNotices
              linkTargetBlank
            />
          ))
        ) : (
          <SearchResultsTable rows={data.nodes || []} />
        ))}
      <Pagination
        {...{ limit, offset }}
        totalEntries={data.nodesCount}
        setOffset={setOffset}
        itemName='clients'
        gridProps={{ mt: 2 }}
      />
    </>
  );
};
export default SearchResults;
