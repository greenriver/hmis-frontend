// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Box } from '@mui/material';
import { useMemo } from 'react';

import HouseholdActionButtons from './elements/HouseholdActionButtons';

import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import ClientName from '@/modules/client/components/ClientName';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { clientBriefName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
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
  clientName: {
    header: 'Name',
    key: 'name',
    render: (hc: HouseholdClientFieldsFragment) => clientBriefName(hc.client),
  },
  linkedClientName: ({
    currentEnrollmentId,
  }: {
    currentEnrollmentId?: string;
  }) => ({
    header: 'Name',
    key: 'name',
    render: (h: HouseholdClientFieldsFragment) => {
      const isCurrentClient = h.enrollment.id === currentEnrollmentId;
      return (
        <ClientName
          client={h.client}
          linkToProfile={false}
          linkToEnrollmentId={!isCurrentClient ? h.enrollment.id : undefined}
          bold={isCurrentClient}
        />
      );
    },
  }),
  entryDate: {
    header: 'Entry Date',
    render: (hc: HouseholdClientFieldsFragment) =>
      parseAndFormatDate(hc.enrollment.entryDate),
  },
  exitDate: {
    header: 'Exit Date',
    render: (hc: HouseholdClientFieldsFragment) =>
      parseAndFormatDate(hc.enrollment.exitDate),
  },
  enrollmentStatus: {
    header: 'Enrollment Status',
    render: (hc: HouseholdClientFieldsFragment) => (
      <EnrollmentStatus enrollment={hc.enrollment} />
    ),
  },
  relationshipToHoh: {
    header: 'Rel. to HoH',
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
    // delete
    header: 'Enrollment Period',
    key: 'status',
    render: (hc: HouseholdClientFieldsFragment) => (
      <EnrollmentDateRangeWithStatus enrollment={hc.enrollment} />
    ),
  },
  mciIds: externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID'),
};

/**
 * Table showing all members that belong to a given household
 */
const HouseholdMemberTable = ({
  enrollmentId,
  hideActions = false,
  columns: columnProp,
  condensed,
}: {
  enrollmentId: string;
  hideActions?: boolean;
  columns?: ColumnDef<HouseholdClientFieldsFragment>[];
  condensed?: boolean;
}) => {
  // fixme clean up
  const { enrollment } = useEnrollmentDashboardContext();
  // TODO: move MCI over to manage hh
  // TODO: move unit over to manage hh
  const { globalFeatureFlags } = useHmisAppSettings();
  const [householdMembers, { loading: householdMembersLoading, error }] =
    useHouseholdMembers(enrollmentId);

  const columns = useMemo(() => {
    if (!householdMembers) return;
    if (columnProp) return columnProp;
    const cols = [
      HOUSEHOLD_MEMBER_COLUMNS.hohIndicator,
      HOUSEHOLD_MEMBER_COLUMNS.linkedClientName({
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

  if (error) throw error;
  if (householdMembersLoading && !householdMembers) return <Loading />;

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
          <HouseholdActionButtons householdMembers={householdMembers || []} />
        </Box>
      )}
    </>
  );
};

export default HouseholdMemberTable;
