// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Box } from '@mui/material';
import { some } from 'lodash-es';
import { useMemo } from 'react';

import { useHouseholdMembers } from '../hooks/useHouseholdMembers';

import HouseholdActionButtons from './elements/HouseholdActionButtons';

import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { HouseholdClientFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

export const nameColumnConfig = (currentClientId: string) => {
  return {
    header: 'Name',
    key: 'name',
    render: (h: HouseholdClientFieldsFragment) => {
      const isCurrentClient = h.client.id === currentClientId;
      const viewEnrollmentPath = generateSafePath(
        EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
        {
          clientId: h.client.id,
          enrollmentId: h.enrollment.id,
        }
      );
      const routerLinkProps = isCurrentClient
        ? undefined
        : {
            to: viewEnrollmentPath,
            target: '_blank',
          };

      return (
        <ClientName
          client={h.client}
          routerLinkProps={routerLinkProps}
          bold={isCurrentClient}
        />
      );
    },
  };
};

export const HOUSEHOLD_MEMBER_COLUMNS = {
  hohIndicator: {
    header: '',
    key: 'indicator',
    width: '1%',
    render: (hc: HouseholdClientFieldsFragment) => (
      <HohIndicator relationshipToHoh={hc.relationshipToHoH} />
    ),
  },
  clientName: ({
    currentClientId,
    linkToProfile = false,
  }: {
    currentClientId?: string;
    linkToProfile?: boolean;
  }) => ({
    header: 'Name',
    key: 'name',
    render: (h: HouseholdClientFieldsFragment) => {
      const isCurrentClient = h.client.id === currentClientId;
      const linkTo = linkToProfile
        ? generateSafePath(ClientDashboardRoutes.PROFILE, {
            clientId: h.client.id,
          })
        : generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId: h.client.id,
            enrollmentId: h.enrollment.id,
          });

      return (
        <ClientName
          client={h.client}
          routerLinkProps={isCurrentClient ? undefined : { to: linkTo }}
          bold={isCurrentClient}
        />
      );
    },
  }),
  enrollmentStatus: {
    header: 'Status',
    render: (hc: HouseholdClientFieldsFragment) => (
      <EnrollmentStatus enrollment={hc.enrollment} />
    ),
  },
  entryDate: {
    header: 'Entry Date',
    render: (hc: HouseholdClientFieldsFragment) =>
      parseAndFormatDate(hc.enrollment.entryDate),
  },
  exitDate: (householdMembers: HouseholdClientFieldsFragment[]) => ({
    header: 'Exit Date',
    hide: !some(householdMembers, (m) => m.enrollment.exitDate),
    render: (hc: HouseholdClientFieldsFragment) =>
      parseAndFormatDate(hc.enrollment.exitDate),
  }),
  relationshipToHoh: {
    header: 'Relationship to HoH',
    render: (hc: HouseholdClientFieldsFragment) => (
      <HmisEnum
        value={hc.relationshipToHoH}
        enumMap={HmisEnums.RelationshipToHoH}
      />
    ),
  },
  assignedUnit: (householdMembers: HouseholdClientFieldsFragment[]) => ({
    header: 'Assigned Unit',
    hide: !some(householdMembers, (m) => m.enrollment.currentUnit),
    render: (hc: HouseholdClientFieldsFragment) =>
      hc.enrollment.currentUnit?.name,
  }),
  dobAge: {
    header: 'DOB / Age',
    key: 'dob',
    render: (hc: HouseholdClientFieldsFragment) => (
      <ClientDobAge client={hc.client} reveal />
    ),
  },
  enrollmentPeriod: {
    header: 'Enrollment Period',
    key: 'status',
    render: (hc: HouseholdClientFieldsFragment) => (
      <EnrollmentStatus
        enrollment={hc.enrollment}
        activeColor='text.primary'
        closedColor='text.primary'
        hideIcon
        withActiveRange
      />
    ),
  },
  // {
  //   header: 'Enrollment Period',
  //   key: 'enrollment_period',
  //   render: ({ enrollment }: HouseholdClientFieldsFragment) => (
  //     <EnrollmentDateRangeWithStatus enrollment={enrollment} />
  //   ),
  // },
  // {
  //   header: 'Destination',
  //   key: 'exit_destination',
  //   hide: !some(householdMembers, (m) => m.enrollment.exitDestination),
  //   render: (hc: HouseholdClientFieldsFragment) => null,
  // },
  // {
  //   header: 'Move in Date',
  //   key: 'move_in_date',
  //   // hide: !some(householdMembers, (m) => m.enrollment.moveInDate),
  //   render: (hc: HouseholdClientFieldsFragment) => null,
  // },
};

/**
 * Table showing all members that belong to a given household
 */
const HouseholdMemberTable = ({
  clientId,
  enrollmentId,
  hideActions = false,
  columns: columnProp,
  condensed,
}: {
  clientId: string;
  enrollmentId: string;
  hideActions?: boolean;
  columns?: ColumnDef<HouseholdClientFieldsFragment>[];
  condensed?: boolean;
}) => {
  const [householdMembers, { loading: householdMembersLoading, error }] =
    useHouseholdMembers(enrollmentId);

  const columns = useMemo(() => {
    if (!householdMembers) return;
    if (columnProp) return columnProp;
    return [
      HOUSEHOLD_MEMBER_COLUMNS.hohIndicator,
      HOUSEHOLD_MEMBER_COLUMNS.clientName({ currentClientId: clientId }),
      HOUSEHOLD_MEMBER_COLUMNS.enrollmentStatus,
      HOUSEHOLD_MEMBER_COLUMNS.entryDate,
      HOUSEHOLD_MEMBER_COLUMNS.exitDate(householdMembers),
      HOUSEHOLD_MEMBER_COLUMNS.relationshipToHoh,
      HOUSEHOLD_MEMBER_COLUMNS.assignedUnit(householdMembers),
    ];
  }, [clientId, columnProp, householdMembers]);

  if (error) throw error;
  if (householdMembersLoading && !householdMembers) return <Loading />;

  return (
    <>
      <GenericTable<HouseholdClientFieldsFragment>
        rows={householdMembers || []}
        columns={columns}
        rowSx={() => ({
          td: condensed ? { py: 1.5, border: 'unset' } : { py: 2 },
          // HoH indicator column
          'td:nth-of-type(1)': { pl: 1, pr: 0 },
        })}
      />
      {!hideActions && (
        <ClientPermissionsFilter
          id={clientId}
          permissions={['canEditEnrollments']}
        >
          <Box sx={{ px: 3 }}>
            <HouseholdActionButtons
              householdMembers={householdMembers || []}
              clientId={clientId}
              enrollmentId={enrollmentId}
            />
          </Box>
        </ClientPermissionsFilter>
      )}
    </>
  );
};

export default HouseholdMemberTable;
