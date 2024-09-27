import SearchIcon from '@mui/icons-material/Search';
import {
  AutocompleteGroupedOption,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Link,
  List,
  MenuItem,
  Paper,
  Popper,
  Typography,
  useAutocomplete,
} from '@mui/material';
import { flatten, isEmpty } from 'lodash-es';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Routes } from '@/app/routes';
import TextInput from '@/components/elements/input/TextInput';
import useDebouncedState from '@/hooks/useDebouncedState';
import { useIsMobile } from '@/hooks/useIsMobile';
import ClientName from '@/modules/client/components/ClientName';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import {
  AddRecentItemMutationVariables,
  RecentItemType,
  useAddRecentItemMutation,
  useClearRecentItemsMutation,
  useGetRecentItemsQuery,
  useOmniSearchClientsQuery,
  useOmniSearchProjectsQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const MAX_RECENT_ITEMS = 6;
const MAX_CLIENT_RESULTS = 6;
const MAX_PROJECT_RESULTS = 6;
const MIN_CHAR_LENGTH_FOR_SEE_MORE = 3;

const OmniSearch: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [value, setValue, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined, 300);

  const {
    data: clientsData,
    loading: clientsLoading,
    error,
  } = useOmniSearchClientsQuery({
    variables: {
      textSearch: debouncedSearch || '',
      limit: MAX_CLIENT_RESULTS,
    },
    skip: !debouncedSearch,
  });
  const { data: projectsData, loading: projectsLoading } =
    useOmniSearchProjectsQuery({
      variables: {
        searchTerm: debouncedSearch as string,
        limit: MAX_PROJECT_RESULTS,
      },
      skip: !debouncedSearch,
    });
  const { data: recentItemsData, loading: recentItemsLoading } =
    useGetRecentItemsQuery();

  const [addRecentItem] = useAddRecentItemMutation();
  const [clearRecentItems, { loading: clearingRecentItems }] =
    useClearRecentItemsMutation();

  const optionsBase = useMemo(() => {
    const clients = clientsData?.clientOmniSearch?.nodes || [];
    const numClients = clientsData?.clientOmniSearch?.nodesCount || 0;
    const projects = projectsData?.projects?.nodes || [];
    const recentItems =
      recentItemsData?.currentUser?.recentItems?.slice(0, MAX_RECENT_ITEMS) ||
      [];

    const seeMoreOption: { id: 'seeMore'; __typename: 'SeeMore' } = {
      id: 'seeMore',
      __typename: 'SeeMore',
    };

    return {
      recentItems: recentItems.map(
        (item) => ({ id: item.id, item, __typename: 'RecentItem' }) as const
      ),
      clients,
      seeMoreOptions: numClients > MAX_CLIENT_RESULTS ? [seeMoreOption] : [],
      projects,
    };
  }, [clientsData, projectsData, recentItemsData]);

  const options = useMemo(() => {
    const { recentItems, clients, seeMoreOptions, projects } = optionsBase;
    return [
      ...(debouncedSearch ? [] : recentItems),
      ...clients,
      ...(debouncedSearch &&
      debouncedSearch.length >= MIN_CHAR_LENGTH_FOR_SEE_MORE
        ? seeMoreOptions
        : []),
      ...projects,
    ];
  }, [optionsBase, debouncedSearch]);

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
        const search = debouncedSearch
          ? new URLSearchParams({ textSearch: debouncedSearch })
          : undefined;
        targetPath =
          generateSafePath(Routes.CLIENT_SEARCH) + (search ? `?${search}` : '');
      }
      return targetPath;
    },
    [debouncedSearch]
  );

  const getOptionLabel = useCallback(
    (option: Option) => {
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
      if (option.__typename === 'SeeMore') {
        const total = clientsData?.clientOmniSearch?.nodesCount || 0;
        label = <Link variant='inherit'>{`See All Results (${total})`}</Link>;
      }
      return label;
    },
    [clientsData]
  );

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

  const content = (
    <Box {...values.getRootProps()}>
      <TextInput
        name='Client and Project search'
        inputProps={{
          ...values.getInputProps(),
          value: value ? value : '',
        }}
        placeholder='Search'
        size='small'
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 0.5 }} color='disabled' />,
          ref: values.setAnchorEl,
        }}
      />
      {!error && (
        <Popper
          open={values.popupOpen}
          anchorEl={values.anchorEl}
          placement='bottom-end'
          sx={{
            zIndex: (theme) => theme.zIndex.modal,
            minWidth: isMobile ? '' : '350px',
          }}
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
                                justifyContent: 'space-between',
                                gap: 4,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 12,
                                  color: (theme) =>
                                    theme.palette.secondary.main,
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
                            // it's a run-time error pass key in through spread
                            const { key, ...optionProps } =
                              values.getOptionProps({
                                option,
                                index: options.findIndex((e) => {
                                  return (
                                    getKeyForOption(e) ===
                                    getKeyForOption(option)
                                  );
                                }),
                              });
                            return (
                              <MenuItem
                                selected={
                                  option.__typename !== 'SeeMore' &&
                                  getOptionTargetPath(option) ===
                                    location.pathname
                                }
                                key={key}
                                {...optionProps}
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
      )}
    </Box>
  );
  return (
    <>
      <ApolloErrorAlert error={error} />
      <Box
        sx={{ px: { md: 1, lg: 2 }, height: '44px', div: { height: '100%' } }}
      >
        {content}
      </Box>
    </>
  );
};

export default OmniSearch;
