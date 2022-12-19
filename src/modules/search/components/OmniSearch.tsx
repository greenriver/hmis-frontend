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
  List,
} from '@mui/material';
import { flatten, isEmpty } from 'lodash-es';
import React, { useState } from 'react';
import { generatePath, useNavigate, useLocation } from 'react-router-dom';

import TextInput from '@/components/elements/input/TextInput';
import { clientName } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { useOmniSearchClientsQuery } from '@/types/gqlTypes';

const OmniSearch: React.FC = () => {
  const [value, setValue] = useState<string | null>('');
  const navigate = useNavigate();
  const location = useLocation();

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
    onInputChange: (_e, value, reason) => reason === 'input' && setValue(value),
    onChange: (_e, option) =>
      option &&
      navigate(generatePath(Routes.CLIENT_DASHBOARD, { clientId: option.id })),
    isOptionEqualToValue: (o, v) => o.id === v.id,
    inputValue: value || '',
    clearOnBlur: false,
  });

  return (
    <Box {...values.getRootProps()}>
      <TextInput
        inputProps={{
          ...values.getInputProps(),
          value,
        }}
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
            <Grid
              container
              component={List}
              spacing={2}
              {...values.getListboxProps()}
            >
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
                          options.map((option, index) => {
                            const targetPath = generatePath(
                              Routes.CLIENT_DASHBOARD,
                              { clientId: option.id }
                            );
                            return (
                              <div key={option.id}>
                                <MenuItem
                                  tabIndex={0}
                                  selected={targetPath === location.pathname}
                                  {...values.getOptionProps({ option, index })}
                                >
                                  {clientName(option)}
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
