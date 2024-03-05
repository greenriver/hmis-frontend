import { Box, Grid, Paper, Stack } from '@mui/material';
import pluralize from 'pluralize';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceTypeSelect from '../ServiceTypeSelect';
import BulkServicesTable from './BulkServicesTable';
import ClientLookupForServiceToggle from './ClientLookupForServiceToggle';
import ServiceDateRangeSelect from './ServiceDateRangeSelect';
import StepCard, { StepCardTitle } from './StepCard';
import DatePicker from '@/components/elements/input/DatePicker';
import PageTitle from '@/components/layout/PageTitle';
import useSearchParamsState, {
  SearchParamsStateType,
} from '@/hooks/useSearchParamState';
import AddNewClientMenu from '@/modules/household/components/elements/AddNewClientMenu';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import CocPicker from '@/modules/projects/components/CocPicker';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import ClientTextSearchForm from '@/modules/search/components/ClientTextSearchForm';
import { ProjectDashboardRoutes } from '@/routes/routes';
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
};

const BulkServicesPage: React.FC<Props> = ({
  serviceTypeId: serviceTypeIdProp,
  serviceTypeName = 'Service',
  title = 'Bulk Service Assignment',
}) => {
  const { project } = useProjectDashboardContext();
  const multipleCocs = project.projectCocs.nodesCount > 1;

  const [filterParams, setFilterParams] = useSearchParamsState(filtersDefaults);

  const { coc, serviceDate, searchTerm, mode: lookupMode } = filterParams;
  const servicePeriod = useMemo(() => {
    if (!filterParams.servicePeriodStart || !filterParams.servicePeriodEnd) {
      return undefined;
    }
    return {
      start: filterParams.servicePeriodStart,
      end: filterParams.servicePeriodEnd,
    };
  }, [filterParams]);

  const serviceTypeId = serviceTypeIdProp || filterParams.serviceTypeId;
  const navigate = useNavigate();

  const sufficientSearchCriteria = useMemo(() => {
    if (lookupMode === 'search') {
      return !!searchTerm && searchTerm.length >= 3;
    }
    if (lookupMode === 'list') {
      return !!servicePeriod;
    }
    return false;
  }, [lookupMode, searchTerm, servicePeriod]);

  const hasServiceTypeSelection = !serviceTypeIdProp;
  const hasSufficientCriteria = useMemo(() => {
    if (!serviceDate) return false;
    if (!serviceTypeId) return false;
    if (multipleCocs && !coc) return false;
    return true;
  }, [coc, multipleCocs, serviceDate, serviceTypeId]);

  const addNewClientMenuButton = useMemo(() => {
    const route = serviceTypeIdProp
      ? ProjectDashboardRoutes.BULK_BED_NIGHTS_NEW_HOUSEHOLD
      : ProjectDashboardRoutes.BULK_SERVICE_NEW_HOUSEHOLD;

    return (
      <RootPermissionsFilter permissions='canEditClients'>
        <AddNewClientMenu
          projectId={project.id}
          onClientAdded={(data) =>
            setFilterParams({ searchTerm: data.client.id })
          }
          navigateToHousehold={() =>
            navigate(generateSafePath(route, { projectId: project.id }))
          }
        />
      </RootPermissionsFilter>
    );
  }, [project, navigate, serviceTypeIdProp, setFilterParams]);

  const stepThreeTitle = `Assign ${pluralize(serviceTypeName, 2)}`;
  return (
    <>
      <PageTitle title={title} />
      <Grid container rowSpacing={2}>
        <Grid item sm={12} md={8} lg={8} xl={4}>
          <StepCard
            step='1'
            title={
              hasServiceTypeSelection
                ? 'Enter Service Details'
                : `Select ${serviceTypeName} Date`
            }
            padded
          >
            <Stack gap={2}>
              {hasServiceTypeSelection && (
                <ServiceTypeSelect
                  projectId={project.id}
                  value={serviceTypeId ? { code: serviceTypeId } : null}
                  onChange={(option) =>
                    setFilterParams({ serviceTypeId: option?.code })
                  }
                  label='Service Type'
                  bulk
                />
              )}
              <DatePicker
                value={serviceDate}
                onChange={(date) => setFilterParams({ serviceDate: date })}
                max={new Date()}
                sx={{ width: '200px' }}
                label={
                  // hide label if its the only input field
                  hasServiceTypeSelection || multipleCocs
                    ? `${serviceTypeName} Date`
                    : null
                }
                ariaLabel={`${serviceTypeName} Date`}
              />
              {multipleCocs && (
                <CocPicker
                  project={project}
                  value={coc}
                  onChange={(option) => setFilterParams({ coc: option?.code })}
                  label='CoC Code'
                  helperText='CoC to use when enrolling new clients'
                />
              )}
            </Stack>
          </StepCard>
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12} lg={10} xl={6}>
          <StepCard
            step='2'
            title='Find Client'
            padded
            disabled={!hasSufficientCriteria}
            disabledText='Select date to search'
          >
            <ClientLookupForServiceToggle
              value={lookupMode}
              serviceTypeName={serviceTypeName}
              onChange={(mode) => {
                setFilterParams({
                  mode,
                  searchTerm: null,
                  servicePeriodStart: null,
                  servicePeriodEnd: null,
                });
              }}
            />
            <Box sx={{ mt: 2 }}>
              {lookupMode === 'search' && (
                <ClientTextSearchForm
                  initialValue={filterParams.searchTerm}
                  onSearch={(value) => setFilterParams({ searchTerm: value })}
                  onClearSearch={() => setFilterParams({ searchTerm: null })}
                  label={null}
                  placeholder='Client Name, DOB, SSN or ID' // FIXME make default?
                  helperText='Search includes all of HMIS'
                  ClearButtonProps={{
                    color: 'error',
                    startIcon: null,
                    variant: 'outlined',
                    children: 'Clear Results',
                    disabled: !filterParams.searchTerm,
                  }}
                />
              )}
              {lookupMode === 'list' && (
                <ServiceDateRangeSelect
                  disabled={!hasSufficientCriteria}
                  initialValue={servicePeriod}
                  onChange={(servicePeriod) =>
                    setFilterParams({
                      servicePeriodStart: servicePeriod?.start,
                      servicePeriodEnd: servicePeriod?.end,
                    })
                  }
                />
              )}
            </Box>
          </StepCard>
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12}>
          {sufficientSearchCriteria && serviceTypeId ? (
            <Paper>
              <BulkServicesTable
                projectId={project.id}
                serviceTypeName={serviceTypeName}
                serviceTypeId={serviceTypeId}
                serviceDate={serviceDate || new Date()}
                searchTerm={searchTerm}
                servicePeriod={servicePeriod}
                cocCode={coc?.code}
                title={
                  <StepCardTitle
                    sx={{ px: 0 }}
                    step='3'
                    title={stepThreeTitle}
                    action={addNewClientMenuButton}
                  />
                }
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
