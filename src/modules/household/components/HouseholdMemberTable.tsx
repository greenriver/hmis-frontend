// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Box } from '@mui/material';
import { useMemo } from 'react';

import { useHouseholdMembers } from '../hooks/useHouseholdMembers';

import HouseholdActionButtons from './elements/HouseholdActionButtons';

import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ExternalIdentifierType,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

export const nameColumnConfig = (currentClientId: string) => {
  return {
    header: 'Name',
    key: 'name',
    render: (h: HouseholdClientFieldsFragment) => {
      const isCurrentClient = h.client.id === currentClientId;
      return (
        <ClientName
          client={h.client}
          linkToEnrollmentId={isCurrentClient ? undefined : h.enrollment.id}
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

      return (
        <ClientName
          client={h.client}
          linkToProfile={!isCurrentClient && linkToProfile}
          linkToEnrollmentId={
            !isCurrentClient && !linkToProfile ? h.enrollment.id : undefined
          }
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
    hide: !householdMembers.some((m) => m.enrollment.exitDate),
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
  assignedUnit: (householdMembers: HouseholdClientFieldsFragment[]) => {
    let unitIds = householdMembers
      .map((m) => m.enrollment.currentUnit?.id)
      .filter((x) => !!x);
    unitIds = [...new Set(unitIds)];
    return {
      header: `Assigned Units (${unitIds.length})`,
      hide: !householdMembers.some((m) => m.enrollment.currentUnit),
      render: (hc: HouseholdClientFieldsFragment) =>
        hc.enrollment.currentUnit?.name,
    };
  },
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
  mciIds: externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID'),
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
  const { globalFeatureFlags } = useHmisAppSettings();
  const [householdMembers, { loading: householdMembersLoading, error }] =
    useHouseholdMembers(enrollmentId);

  const columns = useMemo(() => {
    if (!householdMembers) return;
    if (columnProp) return columnProp;
    const cols = [
      HOUSEHOLD_MEMBER_COLUMNS.hohIndicator,
      HOUSEHOLD_MEMBER_COLUMNS.clientName({ currentClientId: clientId }),
      HOUSEHOLD_MEMBER_COLUMNS.enrollmentStatus,
      HOUSEHOLD_MEMBER_COLUMNS.entryDate,
      HOUSEHOLD_MEMBER_COLUMNS.exitDate(householdMembers),
      HOUSEHOLD_MEMBER_COLUMNS.relationshipToHoh,
      HOUSEHOLD_MEMBER_COLUMNS.assignedUnit(householdMembers),
    ];
    if (globalFeatureFlags?.mciId) {
      return [
        ...cols,
        externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID'),
      ];
    }
    return cols;
  }, [clientId, columnProp, globalFeatureFlags?.mciId, householdMembers]);

  if (error) throw error;
  if (householdMembersLoading && !householdMembers) return <Loading />;

  return (
    <>
      <GenericTable<HouseholdClientFieldsFragment>
        rows={householdMembers || []}
        columns={columns}
        rowSx={() => ({
          td: condensed ? { py: 1, border: 'unset' } : { py: 2 },
          '&:nth-last-of-type(1) td': { pb: 2 },
          '&:first-of-type td': { pt: 2 },
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
