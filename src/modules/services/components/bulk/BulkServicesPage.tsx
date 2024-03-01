import { Box, Grid, Paper, Stack } from '@mui/material';
import pluralize from 'pluralize';
import React, { useMemo, useState } from 'react';
import { ServicePeriod } from '../../types';
import ServiceTypeSelect from '../ServiceTypeSelect';
import BulkServicesTable from './BulkServicesTable';
import ClientLookupForServiceToggle, {
  isClientLookupMode,
} from './ClientLookupForServiceToggle';
import ServiceDateRangeSelect from './ServiceDateRangeSelect';
import StepCard, { StepCardTitle } from './StepCard';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { CommonCard } from '@/components/elements/CommonCard';
import DatePicker from '@/components/elements/input/DatePicker';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import AddNewClientMenu from '@/modules/household/components/elements/AddNewClientMenu';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import CocPicker from '@/modules/projects/components/CocPicker';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import ClientTextSearchInput from '@/modules/search/components/ClientTextSearchInput';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { PickListOption } from '@/types/gqlTypes';

interface Props {
  serviceTypeId?: string;
  serviceTypeName?: string;
  title?: string;
}
const BulkServicesPage: React.FC<Props> = ({
  serviceTypeId: serviceTypeIdProp,
  serviceTypeName = 'Service',
  title = 'Bulk Service Assignment',
}) => {
  const { project } = useProjectDashboardContext();
  const multipleCocs = project.projectCocs.nodesCount > 1;
  const [coc, setCoc] = useState<PickListOption | null>(null);

  const params = useSafeParams();
  const lookupMode = useMemo(() => {
    if (params.lookupMode && isClientLookupMode(params.lookupMode)) {
      return params.lookupMode;
    } else {
      return 'search';
    }
  }, [params]);

  // FIXME move to route or search param. need to retain when navigating from hh screen
  const [serviceTypeId, setServiceTypeId] = useState(serviceTypeIdProp);
  const [serviceDate, setServiceDate] = useState<Date | null>(new Date());

  // 'search' mode value
  const [searchTerm, setSearchTerm] = useState<string>('');
  // 'list' mode value
  const [servicePeriod, setServicePeriod] = useState<
    ServicePeriod | undefined
  >();

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
                  onChange={(option) => setServiceTypeId(option?.code)}
                  label='Service Type'
                  bulk
                />
              )}
              <DatePicker
                value={serviceDate}
                onChange={setServiceDate}
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
                  onChange={setCoc}
                  label='CoC Code'
                  helperText='CoC to use when enrolling new clients'
                />
              )}
            </Stack>
          </StepCard>
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12} lg={10} xl={6}>
          <StepCard step='2' title='Find Client' padded>
            <ButtonTooltipContainer
              placement='right'
              title={
                hasSufficientCriteria
                  ? undefined
                  : 'Enter service details to enable search'
              }
            >
              <>
                <ClientLookupForServiceToggle
                  value={lookupMode}
                  serviceTypeName={serviceTypeName}
                  onNavigate={() => {
                    setSearchTerm('');
                    setServicePeriod(undefined);
                  }}
                />
                <Box sx={{ mt: 2 }}>
                  {lookupMode === 'search' && (
                    <Grid container gap={2}>
                      <Grid item xs={8}>
                        <ClientTextSearchInput
                          showSearchTips={false}
                          helperText='Seach includes all of HMIS'
                          label={null}
                          searchAdornment
                          clearAdornment
                          value={searchTerm}
                          onChange={setSearchTerm}
                          onClearSearch={() => setSearchTerm('')}
                          disabled={!hasSufficientCriteria}
                        />
                      </Grid>
                      {hasSufficientCriteria && (
                        <Grid item xs={3}>
                          <RootPermissionsFilter permissions='canEditClients'>
                            <AddNewClientMenu
                              projectId={project.id}
                              onClientAdded={(data) => {
                                setSearchTerm(data.client.id);
                              }}
                              addHouseholdRoute={
                                serviceTypeIdProp
                                  ? ProjectDashboardRoutes.BULK_BED_NIGHTS_NEW_HOUSEHOLD
                                  : ProjectDashboardRoutes.BULK_SERVICE_NEW_HOUSEHOLD
                              }
                            />
                          </RootPermissionsFilter>
                        </Grid>
                      )}
                    </Grid>
                  )}
                  {lookupMode === 'list' && (
                    <ServiceDateRangeSelect
                      onChange={setServicePeriod}
                      disabled={!hasSufficientCriteria}
                    />
                  )}
                </Box>
              </>
            </ButtonTooltipContainer>
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
                    sx={{ pl: 0 }}
                    step='3'
                    title='Assign Services'
                  />
                }
              />
            </Paper>
          ) : (
            // fixme: need to label twice because of the selection toolbar
            <StepCard
              step='3'
              title={`Assign ${pluralize(serviceTypeName, 2)}`}
            >
              <CommonCard
                sx={{
                  m: 2,
                  textAlign: 'center',
                  color: 'text.disabled',
                  backgroundColor: (theme) => theme.palette.background.default,
                  border: 'unset',
                }}
              >
                No Data, Search to View Clients
              </CommonCard>
            </StepCard>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default BulkServicesPage;
