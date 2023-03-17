import AddIcon from '@mui/icons-material/Add';
import { Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import {
  enrollmentName,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  GetClientEnrollmentsDocument,
  GetClientEnrollmentsQuery,
  GetClientEnrollmentsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const columns: ColumnDef<EnrollmentFieldsFragment>[] = [
  {
    header: 'Status',
    width: '15%',
    render: (e) => <EnrollmentStatus enrollment={e} />,
  },
  {
    header: 'Project',
    render: (row) => enrollmentName(row),
    linkTreatment: true,
    ariaLabel: (row) => enrollmentName(row),
  },
  {
    header: 'Project Type',
    render: (e) => (
      <ProjectTypeChip projectType={e.project.projectType} sx={{ px: 0.5 }} />
    ),
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
  const { clientId } = useSafeParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (enrollment: EnrollmentFieldsFragment) =>
      generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
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
          to={generateSafePath(DashboardRoutes.NEW_ENROLLMENT, {
            clientId,
          })}
          Icon={AddIcon}
        >
          Add Enrollment
        </ButtonLink>
      </Stack>
      <Paper>
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
