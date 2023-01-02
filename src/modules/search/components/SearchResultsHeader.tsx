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
import GenericSelect from '@/components/elements/input/GenericSelect';
import LabelWithContent from '@/components/elements/LabelWithContent';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { ClientSortOption } from '@/types/gqlTypes';

/**
 * Component that appears above the search results
 */
const SearchResultsHeader = ({
  showCardToggle,
  disabled,
  cardsEnabled,
  onChangeCards,
  sortOrder,
  onChangeSortOrder,
}: {
  showCardToggle: boolean;
  disabled: boolean;
  cardsEnabled: boolean;
  onChangeCards: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  sortOrder?: ClientSortOption | null | undefined;
  onChangeSortOrder: (value: ClientSortOption) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Grid
      container
      justifyContent='space-between'
      sx={showCardToggle ? { mb: 4 } : undefined}
    >
      <Grid item sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {showCardToggle && (
          <LabelWithContent
            label='View Results as'
            labelId='results-display-format-label'
            renderChildren={(labelElement) => (
              <ToggleButtonGroup
                value={cardsEnabled}
                exclusive
                onChange={onChangeCards}
                aria-label='results display format'
                aria-labelledby={
                  (labelElement && labelElement.getAttribute('id')) || undefined
                }
              >
                <ToggleButton
                  value={false}
                  data-testid='searchResultsTableButton'
                  aria-label='table'
                  size='small'
                  disabled={disabled}
                >
                  <ViewHeadlineIcon />
                  <Box sx={{ pl: 0.5 }}>Table</Box>
                </ToggleButton>
                <ToggleButton
                  value={true}
                  data-testid='searchResultsCardsButton'
                  aria-label='cards'
                  size='small'
                  disabled={disabled}
                >
                  <ViewCompactIcon />
                  <Box sx={{ pl: 0.5 }}>Cards</Box>
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />
        )}
        <GenericSelect<ClientSortOption, false, false>
          options={
            Object.keys(HmisEnums.ClientSortOption) as ClientSortOption[]
          }
          sx={{ width: 250 }}
          getOptionLabel={(option) => HmisEnums.ClientSortOption[option]}
          label='Sorted by'
          onChange={(_e, value) => value && onChangeSortOrder(value)}
          value={sortOrder}
        />
      </Grid>
      <Grid item>
        <Card sx={{ pl: 2, py: 1, pr: 1 }}>
          <Stack direction='row' spacing={3} sx={{ alignItems: 'center' }}>
            <Typography variant='body2'>
              {t<string>('clientSearch.addClientPrompt')}
            </Typography>
            <ButtonLink
              data-testid='addClientButton'
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
