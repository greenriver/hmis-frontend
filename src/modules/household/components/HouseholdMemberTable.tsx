// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Box } from '@mui/material';
import { useMemo } from 'react';

import HouseholdActionButtons from './elements/HouseholdActionButtons';

import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import ClientName from '@/modules/client/components/ClientName';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
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
    currentEnrollmentId,
    linkToProfile = false,
  }: {
    currentEnrollmentId?: string;
    linkToProfile?: boolean;
  }) => ({
    header: 'Name',
    key: 'name',
    render: (h: HouseholdClientFieldsFragment) => {
      const isCurrentClient = h.enrollment.id === currentEnrollmentId;

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
  dobAge: CLIENT_COLUMNS.dobAge,
  enrollmentPeriod: {
    header: 'Enrollment Period',
    key: 'status',
    render: (hc: HouseholdClientFieldsFragment) => (
      <EnrollmentDateRangeWithStatus enrollment={hc.enrollment} />
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
  householdMembers,
  householdMembersLoading,
  clientId,
  enrollmentId,
  hideActions = false,
  columns: columnProp,
  condensed,
}: {
  householdMembers: HouseholdClientFieldsFragment[];
  clientId: string;
  enrollmentId: string;
  householdMembersLoading?: boolean;
  hideActions?: boolean;
  columns?: ColumnDef<HouseholdClientFieldsFragment>[];
  condensed?: boolean;
}) => {
  const { enrollment } = useEnrollmentDashboardContext();
  const { globalFeatureFlags } = useHmisAppSettings();

  const columns = useMemo(() => {
    if (!householdMembers) return;
    if (columnProp) return columnProp;
    const cols = [
      HOUSEHOLD_MEMBER_COLUMNS.hohIndicator,
      HOUSEHOLD_MEMBER_COLUMNS.clientName({
        currentEnrollmentId: enrollmentId,
      }),
      HOUSEHOLD_MEMBER_COLUMNS.enrollmentPeriod,
      HOUSEHOLD_MEMBER_COLUMNS.dobAge,
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
  }, [enrollmentId, columnProp, globalFeatureFlags?.mciId, householdMembers]);

  if (householdMembersLoading && householdMembers.length === 0)
    return <Loading />;

  return (
    <>
      <SsnDobShowContextProvider>
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
      </SsnDobShowContextProvider>
      {!hideActions && enrollment?.access?.canEditEnrollments && (
        <Box sx={{ px: 3 }}>
          <HouseholdActionButtons
            householdMembers={householdMembers || []}
            clientId={clientId}
            enrollmentId={enrollmentId}
          />
        </Box>
      )}
    </>
  );
};

export default HouseholdMemberTable;
