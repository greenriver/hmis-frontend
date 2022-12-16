import SearchIcon from '@mui/icons-material/Search';
import {
  useAutocomplete,
  Popper,
  Box,
  Paper,
  Grid,
  Typography,
  AutocompleteGroupedOption,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { flatten, isEmpty } from 'lodash-es';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import TextInput from '@/components/elements/input/TextInput';
import { useOmniSearchClientsQuery } from '@/types/gqlTypes';

const OmniSearch: React.FC = () => {
  const [value, setValue] = useState<string | null>(null);

  const { data, loading } = useOmniSearchClientsQuery({
    variables: { input: { textSearch: value } },
    skip: !value,
  });

  const clients = data?.clientSearch?.nodes || [];

  const values = useAutocomplete({
    id: 'omnisearch',
    options: data?.clientSearch?.nodes || [],
    filterOptions: (x) => x,
    groupBy: (option) => option.__typename || 'other',
    getOptionLabel: (option) => option.firstName || option.id,
    onInputChange: (_e, value) => setValue(value),
    inputValue: value || '',
    clearOnBlur: false,
  });

  return (
    <Box {...values.getRootProps()}>
      <TextInput
        inputProps={values.getInputProps()}
        placeholder='Search'
        size='small'
        InputProps={{
          startAdornment: <SearchIcon color='disabled' />,
          ref: values.setAnchorEl,
        }}
      />
      <Popper
        open={values.popupOpen}
        anchorEl={values.anchorEl}
        placement='bottom-start'
      >
        <Paper
          sx={{
            p: 2,
            minWidth: values.anchorEl?.getBoundingClientRect()?.width,
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 2,
                color: 'text.disabled',
              }}
            >
              <CircularProgress color='inherit' />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {!value ? (
                <Grid item xs={12}>
                  <Typography color='text.disabled'>
                    Search for clients and/or projects
                  </Typography>
                </Grid>
              ) : (
                <>
                  {[
                    ['Client', 'Clients'],
                    ['Project', 'Projects'],
                  ].map(([key, label]) => {
                    const options = flatten(
                      (
                        values.groupedOptions as AutocompleteGroupedOption<
                          NonNullable<typeof clients>[number]
                        >[]
                      )
                        .filter((opt) => opt.group === key)
                        .map((g) => g.options)
                    );

                    return (
                      <Grid item key={key}>
                        <Typography variant='overline'>{label}</Typography>
                        {isEmpty(options) ? (
                          <Typography color='text.disabled' variant='body2'>
                            No {label} found
                          </Typography>
                        ) : (
                          options.map((option) => {
                            return (
                              <div key={option.id}>
                                <MenuItem
                                  component={RouterLink}
                                  to={`/client/${option.id}`}
                                  onClick={() => values.anchorEl?.blur()}
                                >
                                  {[option.firstName, option.lastName].join(
                                    ' '
                                  )}
                                </MenuItem>
                              </div>
                            );
                          })
                        )}
                      </Grid>
                    );
                  })}
                </>
              )}
            </Grid>
          )}
        </Paper>
      </Popper>
    </Box>
  );
};

export default OmniSearch;
