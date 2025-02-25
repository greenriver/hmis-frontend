import { Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import { memoize } from 'lodash-es';
import React from 'react';
import { renderCellContents } from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import useAuth from '@/modules/auth/hooks/useAuth';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { HouseholdStatus } from '@/modules/hmis/components/EnrollmentStatus';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  GetUserStaffAssignmentsDocument,
  GetUserStaffAssignmentsQuery,
  GetUserStaffAssignmentsQueryVariables,
  RelationshipToHoH,
  StaffAssignmentWithClientsFragment,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

// use lodash's memoize (rather than react's useMemo) because the result of this function should be memoized by
// row (assignment), not by props or state of the overarching MyClients component.
const memoizedHoh = memoize(
  (assignment: StaffAssignmentWithClientsFragment) => {
    const hoh = assignment.household.householdClients.find(
      (c) => c.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    );
    if (!hoh)
      throw new Error(`Household ${assignment.household.id} does not have HoH`);
    return hoh;
  }
);

const MY_CLIENTS_COLUMNS: ColumnDef<StaffAssignmentWithClientsFragment>[] = [
  {
    header: 'Head of Household',
    render: (assignment) => clientBriefName(memoizedHoh(assignment).client),
  },
  {
    header: 'Members',
    render: (assignment) => assignment.household.householdClients.length,
  },
  {
    header: 'Project',
    render: (assignment) =>
      memoizedHoh(assignment).enrollment.project.projectName,
  },
  {
    ...WITH_ENROLLMENT_COLUMNS.entryDate,
    render: (assignment) => {
      return renderCellContents(
        memoizedHoh(assignment),
        WITH_ENROLLMENT_COLUMNS.entryDate.render
      );
    },
    tableCellProps: undefined, // typescript
  },
  {
    header: 'Household Status',
    render: (assignment) => (
      <HouseholdStatus household={assignment.household} />
    ),
  },
  {
    ...WITH_ENROLLMENT_COLUMNS.moveInDate,
    render: (assignment) => {
      return renderCellContents(
        memoizedHoh(assignment),
        WITH_ENROLLMENT_COLUMNS.moveInDate.render
      );
    },
    tableCellProps: undefined, // typescript
  },
  {
    ...WITH_ENROLLMENT_COLUMNS.lastContactDate,
    render: (assignment) => {
      return renderCellContents(
        memoizedHoh(assignment),
        WITH_ENROLLMENT_COLUMNS.lastContactDate.render
      );
    },
    tableCellProps: undefined, // typescript
  },
  {
    ...WITH_ENROLLMENT_COLUMNS.organizationName,
    render: (assignment) => {
      return renderCellContents(
        memoizedHoh(assignment),
        WITH_ENROLLMENT_COLUMNS.organizationName.render
      );
    },
    tableCellProps: undefined, // typescript
  },
];

const MyClients = () => {
  const { user: currentUser } = useAuth();
  if (!currentUser) return;

  return (
    <>
      <Typography component='h2' variant='h4'>
        My Clients
      </Typography>
      <Typography variant='body1'>
        Households with active enrollments assigned to you
      </Typography>
      <Paper>
        <GenericTableWithData<
          GetUserStaffAssignmentsQuery,
          GetUserStaffAssignmentsQueryVariables,
          StaffAssignmentWithClientsFragment
        >
          queryVariables={{
            id: currentUser.id,
          }}
          queryDocument={GetUserStaffAssignmentsDocument}
          columns={MY_CLIENTS_COLUMNS}
          pagePath='user.staffAssignments'
          noData='No clients assigned to you'
          paginationItemName='assignment'
          defaultPageSize={10}
          recordType='StaffAssignment'
          rowLinkTo={(assignment) => {
            return generateSafePath(
              EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
              {
                clientId: memoizedHoh(assignment).client.id,
                enrollmentId: memoizedHoh(assignment).enrollment.id,
              }
            );
          }}
          rowName={(row) => clientBriefName(memoizedHoh(row).client)}
          rowActionTitle='View Household'
          showOptionalColumns
        />
      </Paper>
    </>
  );
};

export default MyClients;
