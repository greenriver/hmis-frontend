import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import {
  Box,
  Card,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import ButtonLink from '@/components/elements/ButtonLink';
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
}) => {
  const { t } = useTranslation();
  return (
    <Grid
      container
      justifyContent='space-between'
      sx={showCardToggle ? { mb: 4 } : undefined}
    >
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
        <Card sx={{ pl: 2, py: 1, pr: 1 }}>
          <Stack direction='row' spacing={3} sx={{ alignItems: 'center' }}>
            <Typography variant='body2'>
              {t('clientSearch.addClientPrompt')}
            </Typography>
            <ButtonLink
              size='small'
              variant='outlined'
              color='secondary'
              to={Routes.CREATE_CLIENT}
              target='_blank'
            >
              + Add Client
            </ButtonLink>
          </Stack>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SearchResultsHeader;
