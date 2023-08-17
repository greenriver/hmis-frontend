import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import { Box, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ReactNode } from 'react';

import AddClientPrompt from './AddClientPrompt';

import ButtonLink from '@/components/elements/ButtonLink';
import GenericSelect from '@/components/elements/input/GenericSelect';
import LabelWithContent from '@/components/elements/LabelWithContent';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { ClientSortOption } from '@/types/gqlTypes';

export type NewClientCreationOptions = 'open_in_new' | 'open_in_dialog';

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
  addClientButton,
  hideAddClient,
}: {
  showCardToggle: boolean;
  disabled: boolean;
  cardsEnabled: boolean;
  onChangeCards: (event: React.MouseEvent<HTMLElement>, value: any) => void;
  sortOrder?: ClientSortOption | null | undefined;
  onChangeSortOrder: (value: ClientSortOption) => void;
  addClientButton?: ReactNode;
  hideAddClient?: boolean;
}) => {
  return (
    <Grid
      container
      justifyContent='space-between'
      alignItems='end'
      sx={{ mb: 3 }}
    >
      <Grid
        item
        flexWrap='wrap'
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          label: { color: 'text.secondary' },
        }}
      >
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
          sx={{ width: 250, mr: 1 }}
          getOptionLabel={(option) => HmisEnums.ClientSortOption[option]}
          label='Sorted by'
          onChange={(_e, value) => value && onChangeSortOrder(value)}
          value={sortOrder}
        />
      </Grid>
      {!hideAddClient && (
        <AddClientPrompt>
          {addClientButton ? (
            addClientButton
          ) : (
            <ButtonLink
              data-testid='addClientButton'
              to={Routes.CREATE_CLIENT}
              sx={{ px: 3 }}
              Icon={LibraryAddIcon}
            >
              Add Client
            </ButtonLink>
          )}
        </AddClientPrompt>
      )}
    </Grid>
  );
};

export default SearchResultsHeader;
