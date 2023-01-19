import { Stack, Typography } from '@mui/material';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate, serviceDetails } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
  ServiceFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<ServiceFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Date Provided',
    render: (e) => parseAndFormatDate(e.dateProvided),
  },
  {
    header: 'Type',
    render: (e) => (
      <HmisEnum value={e.recordType} enumMap={HmisEnums.RecordType} />
    ),
  },
  {
    header: 'Details',
    render: (e) => (
      <Stack>
        {serviceDetails(e).map((s) => (
          <Typography variant='body2' sx={{ pl: 1 }}>
            {s}
          </Typography>
        ))}
      </Stack>
    ),
  },
  {
    header: '',
    //TODO or faa amount
    render: (e) => e.referralOutcome,
  },
];

const ServicesPanel = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
}) => (
  <Stack>
    <Stack sx={{ mb: 2, alignItems: 'center' }} direction='row' gap={3}>
      <Typography variant='h5'>Services</Typography>
      <ButtonLink
        variant='outlined'
        color='secondary'
        size='small'
        to={generateSafePath(DashboardRoutes.NEW_ASSESSMENT, {
          clientId,
          enrollmentId,
        })}
      >
        + Add Service
      </ButtonLink>
    </Stack>
    <GenericTableWithData<
      GetEnrollmentServicesQuery,
      GetEnrollmentServicesQueryVariables,
      ServiceFieldsFragment
    >
      queryVariables={{ id: enrollmentId }}
      queryDocument={GetEnrollmentServicesDocument}
      columns={columns}
      pagePath='enrollment.services'
      noData='No services.'
    />
  </Stack>
);

export default ServicesPanel;
