import AddIcon from '@mui/icons-material/Add';
import { Paper } from '@mui/material';
import { useCallback } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import {
  enrollmentName,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import {
  EnrollmentDashboardRoutes,
  ClientDashboardRoutes,
} from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  EnrollmentSortOption,
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
      generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
        clientId,
        enrollmentId: enrollment.id,
      }),
    [clientId]
  );

  return (
    <>
      <PageTitle
        title='Enrollments'
        actions={
          <RootPermissionsFilter permissions={['canEnrollClients']}>
            <ButtonLink
              to={generateSafePath(ClientDashboardRoutes.NEW_ENROLLMENT, {
                clientId,
              })}
              Icon={AddIcon}
            >
              Add Enrollment
            </ButtonLink>
          </RootPermissionsFilter>
        }
      />
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
          showFilters
          recordType='Enrollment'
          filterInputType='EnrollmentsForClientFilterOptions'
          noSort
          defaultSortOption={EnrollmentSortOption.MostRecent}
        />
      </Paper>
    </>
  );
};

export default AllEnrollments;
