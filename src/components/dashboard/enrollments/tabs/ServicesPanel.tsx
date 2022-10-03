import { Stack, Typography } from '@mui/material';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { parseAndFormatDate, serviceDetails } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
  ServiceFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<ServiceFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Date Provided',
    render: (e) => parseAndFormatDate(e.dateProvided),
  },
  {
    header: 'Type',
    render: (e) => HmisEnums.RecordType[e.recordType],
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
        to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
          clientId,
          enrollmentId,
          assessmentType: 'TODO',
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
      toNodes={(data: GetEnrollmentServicesQuery) =>
        data.enrollment?.services?.nodes || []
      }
      toNodesCount={(data: GetEnrollmentServicesQuery) =>
        data.enrollment?.services?.nodesCount
      }
      noData='No services.'
    />
  </Stack>
);

export default ServicesPanel;
