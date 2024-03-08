import { Box, Grid, Paper, Stack } from '@mui/material';
import pluralize from 'pluralize';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceTypeSelect from '../ServiceTypeSelect';
import BulkServiceSearchToggle from './BulkServiceSearchToggle';
import BulkServicesTable from './BulkServicesTable';
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
      searchTerm,
      mode: lookupMode,
      servicePeriodStart,
      servicePeriodEnd,
      serviceTypeId: serviceTypeIdParam,
    },
    setFilterParams,
  ] = useSearchParamsState(filtersDefaults);

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
      <Grid container rowSpacing={1}>
        <Grid item sm={12} md={8} lg={8} xl={4}>
          <StepCard
            step='1'
            title={
              showServiceTypePicker
                ? 'Enter Service Details'
                : `Select ${serviceTypeName} Date`
            }
            padded
          >
            <Stack gap={2}>
              {showServiceTypePicker && (
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
                  showServiceTypePicker || showCocPicker
                    ? `${serviceTypeName} Date`
                    : null
                }
                ariaLabel={`${serviceTypeName} Date`}
              />
              {showCocPicker && (
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
            disabled={disableClientSearch}
            disabledText='Select date to search'
          >
            <BulkServiceSearchToggle
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
                  initialValue={searchTerm}
                  onSearch={(value) => setFilterParams({ searchTerm: value })}
                  onClearSearch={() => setFilterParams({ searchTerm: null })}
                  label={null}
                  placeholder='Client Name, DOB, SSN or ID'
                  helperText='Search includes all of HMIS'
                  ClearButtonProps={{
                    color: 'error',
                    startIcon: null,
                    variant: 'outlined',
                    children: 'Clear Results',
                    disabled: !searchTerm,
                  }}
                />
              )}
              {lookupMode === 'list' && (
                <ServiceDateRangeSelect
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
          {sufficientSearchCriteria && !disableClientSearch ? (
            <Paper>
              <BulkServicesTable
                projectId={project.id}
                serviceTypeName={serviceTypeName}
                serviceTypeId={serviceTypeId}
                serviceDate={serviceDate}
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
