import { Box, Grid, Paper } from '@mui/material';
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
import { CommonCard } from '@/components/elements/CommonCard';
import DatePicker from '@/components/elements/input/DatePicker';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import ClientTextSearchInput from '@/modules/search/components/ClientTextSearchInput';

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

  const params = useSafeParams();
  const lookupMode = useMemo(() => {
    if (params.lookupMode && isClientLookupMode(params.lookupMode)) {
      return params.lookupMode;
    } else {
      return 'search';
    }
  }, [params]);

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

  const hasServiceTypeStep = !serviceTypeIdProp;
  return (
    <>
      <PageTitle title={title} />
      <Grid container rowSpacing={2}>
        {hasServiceTypeStep && (
          <>
            <Grid item sm={12} md={8} lg={8} xl={4}>
              <StepCard step='1' title='Select Service Type' padded>
                <ServiceTypeSelect
                  projectId={project.id}
                  value={serviceTypeId ? { code: serviceTypeId } : null}
                  onChange={(option) => setServiceTypeId(option?.code)}
                  label={null}
                  textInputProps={{
                    inputProps: { 'aria-label': 'Service Type' },
                  }}
                  bulk
                />
              </StepCard>
            </Grid>
            <Grid item xs={12}></Grid>
          </>
        )}
        <Grid item sm={12} md={8} lg={8} xl={4}>
          <StepCard
            step={hasServiceTypeStep ? '2' : '1'}
            title={`Select ${serviceTypeName} Date`}
            padded
          >
            <DatePicker
              value={serviceDate}
              onChange={setServiceDate}
              max={new Date()}
              sx={{ width: '200px' }}
              label={null}
              textInputProps={{
                inputProps: { 'aria-label': 'Service Date' },
              }}
            />
          </StepCard>
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12} lg={8} xl={6}>
          <StepCard
            step={hasServiceTypeStep ? '3' : '2'}
            title='Find Client'
            padded
          >
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
                <ClientTextSearchInput
                  showSearchTips={false}
                  helperText='Seach includes all of HMIS'
                  label={null}
                  searchAdornment
                  clearAdornment
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClearSearch={() => setSearchTerm('')}
                />
              )}
              {lookupMode === 'list' && (
                <ServiceDateRangeSelect onChange={setServicePeriod} />
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
                title={
                  <StepCardTitle
                    sx={{ pl: 0 }}
                    step={hasServiceTypeStep ? '4' : '3'}
                    title='Assign Services'
                  />
                }
              />
            </Paper>
          ) : (
            // fixme: need to label twice because of the selection toolbar
            <StepCard
              step={hasServiceTypeStep ? '4' : '3'}
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
