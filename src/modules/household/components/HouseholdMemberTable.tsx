import { Box, Tooltip } from '@mui/material';
import { useMemo } from 'react';

import { externalIdColumn } from '@/components/elements/ExternalIdDisplay';
import { CheckIcon } from '@/components/elements/SemanticIcons';
import GenericTable from '@/components/elements/table/GenericTable';
import ClientName from '@/modules/client/components/ClientName';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import {
  clientBriefName,
  parseAndFormatDate,
  sortHouseholdMembers,
} from '@/modules/hmis/hmisUtil';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import { ManageHouseholdProject } from '@/modules/household/components/ManageHousehold';
import { useHouseholdMenuActions } from '@/modules/household/hooks/useHouseholdMenuActions';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ExternalIdentifierType,
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

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
  hohCheck: {
    header: (
      <Tooltip title='Head of Household' placement='top' arrow>
        <Box sx={{ width: 'fit-content' }}>HoH</Box>
      </Tooltip>
    ),
    key: 'HoH',
    render: (hc: HouseholdClientFieldsFragment) =>
      hc.enrollment.relationshipToHoH ===
        RelationshipToHoH.SelfHeadOfHousehold && <CheckIcon />,
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
};

interface Props {
  household: HouseholdFieldsFragment;
  project: ManageHouseholdProject;
  refetchHousehold: any;
  loading?: boolean;
  canEdit?: boolean;
}

const HouseholdMemberTable = ({
  household,
  project,
  refetchHousehold,
  loading,
  canEdit,
}: Props) => {
  const { globalFeatureFlags } = useHmisAppSettings();

  const currentMembers = useMemo(
    () => sortHouseholdMembers(household.householdClients),
    [household]
  );

  const columns = useMemo(() => {
    const anyExited = household.householdClients.find(
      (hc) => !!hc.enrollment.exitDate
    );

    return [
      HOUSEHOLD_MEMBER_COLUMNS.clientName,
      HOUSEHOLD_MEMBER_COLUMNS.entryDate,
      // If any members have exited, display exit date column
      ...(anyExited ? [HOUSEHOLD_MEMBER_COLUMNS.exitDate] : []),
      HOUSEHOLD_MEMBER_COLUMNS.enrollmentStatus,
      HOUSEHOLD_MEMBER_COLUMNS.hohCheck,
      HOUSEHOLD_MEMBER_COLUMNS.relationshipToHoh,
      HOUSEHOLD_MEMBER_COLUMNS.dobAge,
      // Unit is displayed only if any members have a unit assigned
      HOUSEHOLD_MEMBER_COLUMNS.assignedUnit(household.householdClients),
      // If MCI integration is enabled, display MCI ID column
      ...(globalFeatureFlags?.mciId
        ? [externalIdColumn(ExternalIdentifierType.MciId, 'MCI ID')]
        : []),
    ];
  }, [globalFeatureFlags?.mciId, household.householdClients]);

  const { getRowSecondaryActionConfigs, actionDialogs, actionLoading } =
    useHouseholdMenuActions({
      household,
      refetchHousehold,
      loading,
      currentMembers,
      project,
    });

  return (
    <>
      <SsnDobShowContextProvider>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={currentMembers}
          rowName={(row) => clientBriefName(row.client)}
          rowSecondaryActionConfigs={
            canEdit ? getRowSecondaryActionConfigs : undefined
          }
          columns={columns}
          loading={loading || actionLoading}
          loadingVariant='linear'
          tableProps={{
            'aria-label': 'Manage Household',
          }}
        />
      </SsnDobShowContextProvider>
      {actionDialogs}
    </>
  );
};

export default HouseholdMemberTable;
