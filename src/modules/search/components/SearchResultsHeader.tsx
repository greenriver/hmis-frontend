import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import {
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Button,
  Box,
  Card,
  Stack,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { Routes } from '@/routes/routes';

/**
 * Component that appears above the search results
 */
const SearchResultsHeader = ({
  showCardToggle,
  disabled,
  cardsEnabled,
  onChangeCards,
}: {
  showCardToggle: boolean;
  disabled: boolean;
  cardsEnabled: boolean;
  onChangeCards: (event: React.MouseEvent<HTMLElement>, value: any) => void;
}) => (
  <Grid container justifyContent='space-between' sx={{ mb: 4 }}>
    <Grid item>
      {showCardToggle && (
        <ToggleButtonGroup
          value={cardsEnabled}
          exclusive
          onChange={onChangeCards}
          aria-label='results display format'
        >
          <ToggleButton
            value={false}
            aria-label='table'
            size='small'
            disabled={disabled}
          >
            <ViewHeadlineIcon />
            <Box sx={{ pl: 0.5 }}>Table</Box>
          </ToggleButton>
          <ToggleButton
            value={true}
            aria-label='cards'
            size='small'
            disabled={disabled}
          >
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
);

export default SearchResultsHeader;
