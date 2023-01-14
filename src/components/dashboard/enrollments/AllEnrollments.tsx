import { Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useParams } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  GetClientEnrollmentsDocument,
  GetClientEnrollmentsQuery,
  GetClientEnrollmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<EnrollmentFieldsFragment>[] = [
  {
    header: 'Status',
    width: '15%',
    render: (e) => <EnrollmentStatus enrollment={e} />,
  },
  {
    header: 'Project',
    render: (e) => e.project.projectName,
    linkTreatment: true,
  },
  {
    header: 'Date Range',
    render: (e) => parseAndFormatDateRange(e.entryDate, e.exitDate),
  },
  {
    header: 'Household Size',
    render: (e) => e.householdSize,
  },
];

const AllEnrollments = () => {
  const { clientId } = useParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (enrollment: EnrollmentFieldsFragment) =>
      generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
        clientId,
        enrollmentId: enrollment.id,
      }),
    [clientId]
  );

  return (
    <>
      <Stack
        gap={3}
        direction='row'
        justifyContent={'space-between'}
        sx={{ mb: 2, pr: 1, alignItems: 'center' }}
      >
        <Typography variant='h4'>All Enrollments</Typography>
        <ButtonLink
          variant='outlined'
          color='secondary'
          to={generatePath(DashboardRoutes.NEW_ENROLLMENT, {
            clientId,
          })}
        >
          + Add Enrollment
        </ButtonLink>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <GenericTableWithData<
          GetClientEnrollmentsQuery,
          GetClientEnrollmentsQueryVariables,
          EnrollmentFieldsFragment
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientEnrollmentsDocument}
          rowLinkTo={rowLinkTo}
          columns={columns}
          pagePath='client.enrollments'
          fetchPolicy='cache-and-network'
        />
      </Paper>
    </>
  );
};

export default AllEnrollments;
