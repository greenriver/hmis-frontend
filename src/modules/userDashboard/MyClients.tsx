import { Paper } from '@mui/material';
import Typography from '@mui/material/Typography';
import { memoize } from 'lodash-es';
import React from 'react';
import { EnrollmentDashboardRoutes } from '@/app/routes';
import { ColumnDef } from '@/components/elements/table/types';
import useAuth from '@/modules/auth/hooks/useAuth';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { HouseholdStatus } from '@/modules/hmis/components/EnrollmentStatus';
import {
  clientBriefName,
  parseAndFormatDateRange,
} from '@/modules/hmis/hmisUtil';
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
    linkTreatment: true,
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
    header: 'Enrollment Period',
    render: (assignment) => {
      const hoh = memoizedHoh(assignment);
      return parseAndFormatDateRange(
        hoh.enrollment.entryDate,
        hoh.enrollment.exitDate
      );
    },
  },
  {
    header: 'Status',
    render: (assignment) => (
      <HouseholdStatus household={assignment.household} />
    ),
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
        />
      </Paper>
    </>
  );
};

export default MyClients;
