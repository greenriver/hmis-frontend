import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink, generatePath } from 'react-router-dom';

import { Columns } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { DashboardRoutes } from '@/routes/routes';
import {
  ServiceFieldsFragment,
  GetEnrollmentServicesDocument,
  GetEnrollmentServicesQuery,
  GetEnrollmentServicesQueryVariables,
} from '@/types/gqlTypes';

const columns: Columns<ServiceFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
];

const ServicesPanel = ({
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
}) => {
  // FIXME: add back when query works
  return <>WIP</>;

  return (
    <Stack>
      <Stack sx={{ mb: 2, alignItems: 'center' }} direction='row' gap={3}>
        <Typography variant='h5'>Services</Typography>
        <Button
          variant='outlined'
          color='secondary'
          component={RouterLink}
          size='small'
          to={generatePath(DashboardRoutes.NEW_ASSESSMENT, {
            clientId,
            enrollmentId,
            assessmentType: 'TODO',
          })}
        >
          + Add Service
        </Button>
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
      />
    </Stack>
  );
};

export default ServicesPanel;
