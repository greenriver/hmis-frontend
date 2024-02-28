import { Box, Grid, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { ServicePeriod } from '../../types';
import BulkServicesTable from './BulkServicesTable';
import ClientLookupForServiceToggle, {
  ClientLookupMode,
} from './ClientLookupForServiceToggle';
import ServiceDateRangeSelect from './ServiceDateRangeSelect';
import StepCard from './StepCard';
import { CommonCard } from '@/components/elements/CommonCard';
import DatePicker from '@/components/elements/input/DatePicker';
import PageTitle from '@/components/layout/PageTitle';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import ClientTextSearchInput from '@/modules/search/components/ClientTextSearchInput';

interface Props {
  lookupMode?: ClientLookupMode;
}
const BulkServicesPage: React.FC<Props> = ({ lookupMode = 'search' }) => {
  const { project } = useProjectDashboardContext();
  const [serviceDate, setServiceDate] = useState<Date | null>(new Date());

  // 'search' mode value
  const [searchTerm, setSearchTerm] = useState<string>('');
  // 'service_date' mode value
  const [servicePeriod, setServicePeriod] = useState<
    ServicePeriod | undefined
  >();

  const sufficientSearchCriteria = useMemo(() => {
    if (lookupMode === 'search') {
      return !!searchTerm && searchTerm.length >= 3;
    }
    if (lookupMode === 'service_date') {
      return !!servicePeriod;
    }
    return false;
  }, [lookupMode, searchTerm, servicePeriod]);

  return (
    <>
      <PageTitle title='Bulk Service Assignment' />
      <Grid container rowSpacing={2}>
        <Grid item sm={12} md={8} lg={8} xl={4}>
          <StepCard step='1' title='Set Bed Night Date' padded>
            <DatePicker
              label='Bed Night Date'
              value={serviceDate}
              onChange={setServiceDate}
              max={new Date()}
              sx={{ width: '200px' }}
            />
          </StepCard>
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12} lg={8} xl={6}>
          <StepCard step='2' title='Find Client' padded>
            <ClientLookupForServiceToggle
              value={lookupMode}
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
                  // label={null}
                  searchAdornment
                  clearAdornment
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onClearSearch={() => setSearchTerm('')}
                />
              )}
              {lookupMode === 'service_date' && (
                <ServiceDateRangeSelect onChange={setServicePeriod} />
              )}
            </Box>
          </StepCard>
        </Grid>
        <Grid item xs={12}></Grid>
        <Grid item xs={12}>
          {sufficientSearchCriteria ? (
            <Paper>
              <BulkServicesTable
                projectId={project.id}
                serviceTypeName='Bed Night'
                serviceTypeId='209'
                serviceDate={serviceDate || new Date()}
                searchTerm={searchTerm}
                servicePeriod={servicePeriod}
              />
            </Paper>
          ) : (
            // fixme: need to label twice because of the selection toolbar
            <StepCard step='3' title='Assign Services'>
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
