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
  Divider,
  Link,
} from '@mui/material';
import { flatten, isEmpty } from 'lodash-es';
import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import TextInput from '@/components/elements/input/TextInput';
import ClientName from '@/modules/client/components/ClientName';
import { Routes } from '@/routes/routes';
import {
  AddRecentItemMutationVariables,
  RecentItemType,
  useAddRecentItemMutation,
  useClearRecentItemsMutation,
  useGetRecentItemsQuery,
  useOmniSearchClientsQuery,
  useOmniSearchProjectsQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const OmniSearch: React.FC = () => {
  const [value, setValue] = useState<string | null>('');
  const navigate = useNavigate();
  const location = useLocation();

  const { data: clientsData, loading: clientsLoading } =
    useOmniSearchClientsQuery({
      variables: { textSearch: value || '' },
      skip: !value,
    });
  const { data: projectsData, loading: projectsLoading } =
    useOmniSearchProjectsQuery({
      variables: { searchTerm: value as string },
      skip: !value,
    });
  const { data: recentItemsData, loading: recentItemsLoading } =
    useGetRecentItemsQuery();

  const [addRecentItem] = useAddRecentItemMutation();
  const [clearRecentItems, { loading: clearingRecentItems }] =
    useClearRecentItemsMutation();

  const optionsBase = useMemo(() => {
    const allClients = clientsData?.clientOmniSearch?.nodes || [];
    const projects = projectsData?.projects?.nodes?.slice(0, 4) || [];
    const recentItems =
      recentItemsData?.currentUser?.recentItems?.slice(0, 2) || [];
    const clients = allClients.slice(0, 4);

    const seeMoreOption: { id: 'seeMore'; __typename: 'SeeMore' } = {
      id: 'seeMore',
      __typename: 'SeeMore',
    };

    return {
      recentItems: recentItems.map(
        (item) => ({ id: item.id, item, __typename: 'RecentItem' } as const)
      ),
      clients,
      seeMoreOptions: allClients.length > 4 ? [seeMoreOption] : [],
      projects,
    };
  }, [clientsData, projectsData, recentItemsData]);

  const options = useMemo(() => {
    const { recentItems, clients, seeMoreOptions, projects } = optionsBase;
    return [
      ...(value ? [] : recentItems),
      ...clients,
      ...(value && value.length > 2 ? seeMoreOptions : []),
      ...projects,
    ];
  }, [optionsBase, value]);

  const loading = clientsLoading || projectsLoading || recentItemsLoading;

  type Option = NonNullable<typeof options>[number];

  const getOptionTargetPath = useCallback(
    (option: Option) => {
      let targetPath: string | null = null;
      if (
        option.__typename === 'Client' ||
        (option.__typename === 'RecentItem' &&
          option.item.__typename === 'Client')
      ) {
        targetPath = generateSafePath(Routes.CLIENT_DASHBOARD, {
          clientId: option.id,
        });
      }
      if (
        option.__typename === 'Project' ||
        (option.__typename === 'RecentItem' &&
          option.item.__typename === 'Project')
      ) {
        targetPath = generateSafePath(Routes.PROJECT, {
          projectId: option.id,
        });
      }
      if (option.__typename === 'SeeMore') {
        const search = value
          ? new URLSearchParams({ textSearch: value })
          : undefined;
        targetPath =
          generateSafePath(Routes.CLIENT_SEARCH) + (search ? `?${search}` : '');
      }
      return targetPath;
    },
    [value]
  );

  const getOptionLabel = useCallback((option: Option) => {
    let label: React.ReactNode = option.id;
    if (option.__typename === 'Client')
      label = <ClientName client={option} variant='body1' />;
    if (
      option.__typename === 'RecentItem' &&
      option.item.__typename === 'Client'
    )
      label = <ClientName client={option.item} variant='body1' />;
    if (option.__typename === 'Project') label = option.projectName;
    if (
      option.__typename === 'RecentItem' &&
      option.item.__typename === 'Project'
    )
      label = option.item.projectName;
    if (option.__typename === 'SeeMore')
      label = <Link variant='inherit'>See All Clients</Link>;
    return label;
  }, []);

  const handleSelectItem = useCallback(
    (option: Option) => {
      let input: AddRecentItemMutationVariables | undefined;

      if (option.__typename === 'Client')
        input = { itemType: RecentItemType.Client, itemId: option.id };
      if (
        option.__typename === 'RecentItem' &&
        option.item.__typename === 'Client'
      )
        input = { itemType: RecentItemType.Client, itemId: option.item.id };
      if (option.__typename === 'Project')
        input = { itemType: RecentItemType.Project, itemId: option.id };
      if (
        option.__typename === 'RecentItem' &&
        option.item.__typename === 'Project'
      )
        input = { itemType: RecentItemType.Project, itemId: option.item.id };

      if (input)
        addRecentItem({
          variables: input,
        });

      const targetPath = getOptionTargetPath(option);
      if (targetPath) navigate(targetPath);
    },
    [addRecentItem, getOptionTargetPath, navigate]
  );

  const getKeyForOption = useCallback((option: Option): string => {
    if (option.__typename === 'RecentItem')
      return [option.__typename, option.item.__typename, option.id].join(':');
    return [option.__typename, option.id].join(':');
  }, []);

  const values = useAutocomplete({
    id: 'omnisearch',
    options,
    value: null, // This must be null to ensure the autocomplete fires onChange every time an item is selected
    filterOptions: (x) => x,
    getOptionLabel: (x) => getKeyForOption(x),
    groupBy: (option) => option.__typename || 'other',
    onInputChange: (_e, value, reason) => reason === 'input' && setValue(value),
    onChange: (_e, option) => option && handleSelectItem(option),
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
        placement='bottom-end'
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
              {isEmpty(options) ? (
                <Grid item xs={12}>
                  <Typography color='text.disabled'>
                    {value
                      ? 'No Results found'
                      : 'Search for clients or projects'}
                  </Typography>
                </Grid>
              ) : (
                <>
                  {[
                    ['RecentItem', 'Recent Items'],
                    ['Client', 'Clients'],
                    ['Project', 'Projects'],
                  ].map(([key, label]) => {
                    const optionGroup = flatten(
                      (
                        values.groupedOptions as AutocompleteGroupedOption<
                          NonNullable<typeof options>[number]
                        >[]
                      )
                        .filter(
                          (opt) =>
                            opt.group === key ||
                            (key === 'Client' && opt.group === 'SeeMore')
                        )
                        .reduce(
                          (acc, g) => [...acc, ...g.options],
                          [] as NonNullable<typeof options>
                        )
                    );

                    if (isEmpty(optionGroup)) return null;

                    return (
                      <Grid item xs={12} key={key}>
                        <Box sx={{ mx: 2, mb: 0.5 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: 4,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: (theme) => theme.palette.secondary.main,
                                textTransform: 'uppercase',
                                mb: 1,
                              }}
                            >
                              {label}
                            </Typography>
                            {key === 'RecentItem' && (
                              <Box
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                <>
                                  <CircularProgress
                                    size={14}
                                    sx={{
                                      transition: 'opacity 0.2s',
                                      opacity: clearingRecentItems ? 1 : 0,
                                    }}
                                  />
                                  &nbsp;
                                </>
                                <Link
                                  component='button'
                                  variant='body2'
                                  onClick={() => clearRecentItems()}
                                >
                                  Clear Recents
                                </Link>
                              </Box>
                            )}
                          </Box>
                          <Divider />
                        </Box>
                        {optionGroup.map((option) => {
                          return (
                            <MenuItem
                              key={`${option.__typename}:${option.id}`}
                              selected={
                                option.__typename !== 'SeeMore' &&
                                getOptionTargetPath(option) ===
                                  location.pathname
                              }
                              {...values.getOptionProps({
                                option,
                                index: options.findIndex((e) => {
                                  return (
                                    getKeyForOption(e) ===
                                    getKeyForOption(option)
                                  );
                                }),
                              })}
                            >
                              {getOptionLabel(option)}
                            </MenuItem>
                          );
                        })}
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
