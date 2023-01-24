import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';

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

interface Props {
  clientId: string;
  enrollmentId: string;
}

const columns: ColumnDef<ServiceFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Date Provided',
    render: (e) => parseAndFormatDate(e.dateProvided),
  },
  {
    header: 'Type',
    linkTreatment: true,
    render: (e) => (
      <HmisEnum
        value={e.recordType}
        color='inherit'
        enumMap={HmisEnums.RecordType}
      />
    ),
  },
  {
    header: 'Details',
    render: (e) => (
      <Stack>
        {serviceDetails(e).map((s, i) => (
          <Typography key={i} variant='body2' sx={{ pl: 1 }}>
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

const ServicesTable: React.FC<Props> = ({ clientId, enrollmentId }) => {
  const rowLinkTo = useCallback(
    (record: ServiceFieldsFragment) =>
      generateSafePath(DashboardRoutes.EDIT_SERVICE, {
        clientId,
        enrollmentId,
        serviceId: record.id,
      }),
    [clientId, enrollmentId]
  );

  return (
    <Stack>
      <GenericTableWithData<
        GetEnrollmentServicesQuery,
        GetEnrollmentServicesQueryVariables,
        ServiceFieldsFragment
      >
        rowLinkTo={rowLinkTo}
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentServicesDocument}
        columns={columns}
        pagePath='enrollment.services'
        noData='No services.'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />
    </Stack>
  );
};

export default ServicesTable;
