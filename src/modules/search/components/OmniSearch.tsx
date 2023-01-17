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
import { flatten, isEmpty, sortBy } from 'lodash-es';
import React, { useMemo, useState, useCallback } from 'react';
import { generatePath, useNavigate, useLocation } from 'react-router-dom';

import TextInput from '@/components/elements/input/TextInput';
import { clientNameWithoutPreferred } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import {
  useOmniSearchClientsQuery,
  useOmniSearchProjectsQuery,
} from '@/types/gqlTypes';

const OmniSearch: React.FC = () => {
  const [value, setValue] = useState<string | null>('');
  const navigate = useNavigate();
  const location = useLocation();

  const { data: clientsData, loading: clientsLoading } =
    useOmniSearchClientsQuery({
      variables: { input: { textSearch: value } },
      skip: !value,
    });
  const { data: projectsData, loading: projectsLoading } =
    useOmniSearchProjectsQuery({
      variables: { searchTerm: value as string },
      skip: !value,
    });

  const options = useMemo(() => {
    const clients = clientsData?.clientSearch?.nodes || [];
    const projects = projectsData?.projects?.nodes || [];
    return sortBy([...clients, ...projects], '__typename');
  }, [clientsData, projectsData]);

  const loading = clientsLoading || projectsLoading;

  const getOptionTargetPath = useCallback(
    (option: NonNullable<typeof options>[number]) => {
      let targetPath: string | null = null;
      if (option.__typename === 'Client') {
        targetPath = generatePath(Routes.CLIENT_DASHBOARD, {
          clientId: option.id,
        });
      }
      if (option.__typename === 'Project') {
        targetPath = generatePath(Routes.PROJECT, {
          projectId: option.id,
        });
      }
      return targetPath;
    },
    []
  );

  const getOptionLabel = useCallback(
    (option: NonNullable<typeof options>[number]) => {
      let label = option.id;
      if (option.__typename === 'Client')
        label = clientNameWithoutPreferred(option);
      if (option.__typename === 'Project') label = option.projectName;
      return label;
    },
    []
  );

  const values = useAutocomplete({
    id: 'omnisearch',
    options,
    filterOptions: (x) => x,
    groupBy: (option) => option.__typename || 'other',
    getOptionLabel,
    onInputChange: (_e, value, reason) => reason === 'input' && setValue(value),
    onChange: (_e, option) => {
      if (!option) return;
      const targetPath = getOptionTargetPath(option);
      if (targetPath) navigate(targetPath);
    },
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
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
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
              component={List} // getListBoxProps expects to attach to a <ul>, and List is a ul with no default styling
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
                    const optionGroup = flatten(
                      (
                        values.groupedOptions as AutocompleteGroupedOption<
                          NonNullable<typeof options>[number]
                        >[]
                      )
                        .filter((opt) => opt.group === key)
                        .map((g) => g.options)
                    );

                    return (
                      <Grid item key={key}>
                        <Typography variant='overline'>{label}</Typography>
                        {isEmpty(optionGroup) ? (
                          <Typography color='text.disabled' variant='body2'>
                            No {label} found
                          </Typography>
                        ) : (
                          optionGroup.map((option) => {
                            return (
                              <div key={option.id}>
                                <MenuItem
                                  selected={
                                    getOptionTargetPath(option) ===
                                    location.pathname
                                  }
                                  {...values.getOptionProps({
                                    option,
                                    index: options.findIndex(
                                      (e) => e.id === option.id
                                    ),
                                  })}
                                >
                                  {getOptionLabel(option)}
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
