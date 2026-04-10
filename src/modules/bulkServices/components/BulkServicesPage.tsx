import { Box, Grid, Paper, Stack } from '@mui/material';
import pluralize from 'pluralize';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BulkServiceSearchToggle from './BulkServiceSearchToggle';
import BulkServicesTable from './BulkServicesTable';
import ServiceDateRangeSelect from './ServiceDateRangeSelect';
import StepCard from './StepCard';
import StepCardTitle from './StepCardTitle';
import DatePicker from '@/components/elements/input/DatePicker';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import useSearchParamsState, {
  SearchParamsStateType,
} from '@/hooks/useSearchParamState';
import AddNewClientMenu from '@/modules/household/components/elements/AddNewClientMenu';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import CocPicker from '@/modules/projects/components/CocPicker';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import ClientTextSearchForm from '@/modules/search/components/ClientTextSearchForm';
import useClientSearchParams from '@/modules/search/hooks/useClientSearchParams';
import { clientSearchInputToSearchParamsCacheFields } from '@/modules/search/searchUtil';
import ServiceTypeSelect from '@/modules/services/components/ServiceTypeSelect';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { BulkServicesClientSearchQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  serviceTypeId?: string;
  serviceTypeName?: string;
  title?: string;
}

const filtersDefaults: SearchParamsStateType = {
  serviceTypeId: { type: 'string', default: null },
  coc: { type: 'string', default: null },
  serviceDate: { type: 'date', default: new Date() },
  servicePeriodStart: { type: 'date', default: null },
  servicePeriodEnd: { type: 'date', default: null },
  searchTerm: { type: 'string', default: null },
  mode: { type: 'string', default: 'search' },
  searchQueryId: { type: 'string', default: null },
};

const BulkServicesPage: React.FC<Props> = ({
  serviceTypeId: serviceTypeIdProp,
  serviceTypeName = 'Service',
  title = 'Bulk Service Assignment',
}) => {
  const { project } = useProjectDashboardContext();
  const navigate = useNavigate();

  // If project operates in multiple CoCs, we need to show CoC picker
  // so that we can set EnrollmentCoC when we enroll new clients
  const showCocPicker = project.projectCocs.nodesCount > 1;

  // If Service Type was passed in as a prop, we don't let the user change it
  const showServiceTypePicker = !serviceTypeIdProp;

  // State is stored in Search Params so we can preserve it on navigation
  const [
    {
      coc,
      serviceDate,
      searchQueryId,
      mode: lookupMode,
      servicePeriodStart,
      servicePeriodEnd,
      serviceTypeId: serviceTypeIdParam,
    },
    setFilterParams,
  ] = useSearchParamsState({ paramsDefinition: filtersDefaults });

  // Internal state for the plaintext search term, NOT stored in search params
  const [searchTerm, setSearchTerm] = useState<string | null>(null);

  // Load the persisted client search term if there is a searchQueryId in the URL params
  const {
    clientSearchParams,
    loading: clientSearchParamsLoading,
    writeClientSearchParamsToCache,
  } = useClientSearchParams({
    searchQueryId,
  });

  // When the persisted search term changes, update the internal state searchTerm
  useEffect(() => {
    if (clientSearchParams) {
      setSearchTerm(clientSearchParams.textSearch || null);
    }
  }, [clientSearchParams]);

  const serviceTypeId = useMemo(
    () => serviceTypeIdProp || serviceTypeIdParam,
    [serviceTypeIdProp, serviceTypeIdParam]
  );

  const servicePeriod = useMemo(() => {
    if (!servicePeriodStart || !servicePeriodEnd) {
      return undefined;
    }
    return {
      start: servicePeriodStart,
      end: servicePeriodEnd,
    };
  }, [servicePeriodStart, servicePeriodEnd]);

  // whether to disable "step 2"
  const disableClientSearch = useMemo(() => {
    if (!serviceDate) return true; // required for search
    if (!serviceTypeId) return true; // required for search
    if (showCocPicker && !coc) return true;
    return false;
  }, [coc, showCocPicker, serviceDate, serviceTypeId]);

  // whether we have enough criteria to perform the client search
  const sufficientSearchCriteria = useMemo(() => {
    if (lookupMode === 'search') {
      return !!searchTerm && searchTerm.length >= 3;
    }
    if (lookupMode === 'list') {
      return !!servicePeriod;
    }
    return false;
  }, [lookupMode, searchTerm, servicePeriod]);

  const addNewClientMenuButton = useMemo(() => {
    const route = serviceTypeIdProp
      ? ProjectDashboardRoutes.BULK_BED_NIGHTS_NEW_HOUSEHOLD
      : ProjectDashboardRoutes.BULK_SERVICE_NEW_HOUSEHOLD;

    return (
      <RootPermissionsFilter permissions='canEditClients'>
        <AddNewClientMenu
          projectId={project.id}
          onClientAdded={(data) => setSearchTerm(data.client.id)}
          navigateToHousehold={() =>
            navigate(
              {
                pathname: generateSafePath(route, { projectId: project.id }),
              },
              {
                state: {
                  prev: window.location.pathname + window.location.search,
                },
              }
            )
          }
        />
      </RootPermissionsFilter>
    );
  }, [serviceTypeIdProp, project.id, navigate]);

  const stepThreeTitle = `Assign ${pluralize(serviceTypeName, 2)}`;

  const handleSearchCompleted = useCallback(
    (data: BulkServicesClientSearchQuery) => {
      const returnedSearchQueryId = data?.clientSearch.searchQueryId;
      if (returnedSearchQueryId && searchQueryId !== returnedSearchQueryId) {
        // Prime the Apollo cache with the params we just received
        writeClientSearchParamsToCache(
          returnedSearchQueryId,
          clientSearchInputToSearchParamsCacheFields({ textSearch: searchTerm })
        );

        // Update the search params in the URL
        setFilterParams((prev) => ({
          ...prev,
          searchQueryId: returnedSearchQueryId,
        }));
      }
    },
    [searchQueryId, setFilterParams, searchTerm, writeClientSearchParamsToCache]
  );

  if (clientSearchParamsLoading) return <Loading />;

  return (
    <>
      <PageTitle title={title} />
      <Grid container rowSpacing={2}>
        <Grid item xs={12}>
          <StepCard
            step='1'
            title={
              showServiceTypePicker
                ? 'Enter Service Details'
                : `Select ${serviceTypeName} Date`
            }
            padded
          >
            <Stack gap={2} maxWidth='380px'>
              {showServiceTypePicker && (
                <ServiceTypeSelect
                  projectId={project.id}
                  value={serviceTypeId ? { code: serviceTypeId } : null}
                  onChange={(option) => {
                    // ServiceTypeSelect's internal effect causes `onChange` to be called even when option value is not changing.
                    // To avoid unneeded rerenders, only setFilterParams if the value is changing
                    if (option?.code !== serviceTypeId) {
                      setFilterParams((prev) => ({
                        ...prev,
                        serviceTypeId: option?.code,
                      }));
                    }
                  }}
                  label='Service Type'
                  bulk
                />
              )}
              <DatePicker
                value={serviceDate}
                onChange={(date) =>
                  setFilterParams((prev) => ({ ...prev, serviceDate: date }))
                }
                max={new Date()}
                sx={{ width: '200px' }}
                label={
                  // hide label if its the only input field
                  showServiceTypePicker || showCocPicker
                    ? `${serviceTypeName} Date`
                    : null
                }
                ariaLabel={`${serviceTypeName} Date`}
              />
              {showCocPicker && (
                <CocPicker
                  project={project}
                  value={coc ? { code: coc } : null}
                  onChange={(option) =>
                    setFilterParams((prev) => ({ ...prev, coc: option?.code }))
                  }
                  label='CoC Code'
                  helperText='CoC to use when enrolling new clients'
                />
              )}
            </Stack>
          </StepCard>
        </Grid>
        <Grid item xs={12}>
          <StepCard
            step='2'
            title='Find Client'
            padded
            disabled={disableClientSearch}
            disabledText='Enter Service Details to Search'
          >
            <BulkServiceSearchToggle
              value={lookupMode}
              serviceTypeName={serviceTypeName}
              onChange={(mode) => {
                setFilterParams((prev) => ({
                  ...prev, // Preserve selected CoC, Service Date, and Service Type
                  mode,
                  searchQueryId: null, // reset the search query ID in the URL
                  servicePeriodStart: null,
                  servicePeriodEnd: null,
                }));
                setSearchTerm(null); // reset the plaintext searchTerm
              }}
            />
            <Box sx={{ mt: 2 }} maxWidth='800px'>
              {lookupMode === 'search' && (
                <ClientTextSearchForm
                  initialValue={searchTerm || undefined}
                  onSearch={(value) => setSearchTerm(value)}
                  onClearSearch={() => {
                    setSearchTerm(null);
                    setFilterParams((prev) => ({
                      ...prev,
                      searchQueryId: null,
                    }));
                  }}
                  label={null}
                  placeholder='Client Name, DOB, SSN or ID'
                  helperText='Search includes all of HMIS'
                  ClearButtonProps={{
                    color: 'error',
                    startIcon: null,
                    variant: 'outlined',
                    children: 'Reset Search',
                    sx: { whiteSpace: 'nowrap' },
                    disabled: !searchTerm,
                  }}
                />
              )}
              {lookupMode === 'list' && (
                <ServiceDateRangeSelect
                  initialValue={servicePeriod}
                  onChange={(servicePeriod) =>
                    setFilterParams((prev) => ({
                      ...prev,
                      servicePeriodStart: servicePeriod?.start,
                      servicePeriodEnd: servicePeriod?.end,
                    }))
                  }
                />
              )}
            </Box>
          </StepCard>
        </Grid>
        <Grid item xs={12}>
          {sufficientSearchCriteria && !disableClientSearch ? (
            <Paper>
              <BulkServicesTable
                projectId={project.id}
                serviceTypeName={serviceTypeName}
                serviceTypeId={serviceTypeId}
                serviceDate={serviceDate}
                searchTerm={searchTerm || undefined}
                servicePeriod={servicePeriod}
                cocCode={coc}
                title={
                  <StepCardTitle
                    sx={{ px: 0 }}
                    step='3'
                    title={stepThreeTitle}
                    action={addNewClientMenuButton}
                  />
                }
                onCompleted={handleSearchCompleted}
              />
            </Paper>
          ) : (
            // need to label twice because of the selection toolbar
            <StepCard
              step='3'
              title={stepThreeTitle}
              disabled
              disabledText='No Data, Search to View Clients'
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default BulkServicesPage;
