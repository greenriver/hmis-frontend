import { Box, Tooltip } from '@mui/material';
import { useMemo } from 'react';

import { HOUSEHOLD_MEMBER_COLUMNS } from './HouseholdMemberTable';

import { CheckIcon } from '@/components/elements/SemanticIcons';
import GenericTable from '@/components/elements/table/GenericTable';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { clientBriefName, sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import { ManageHouseholdProject } from '@/modules/household/components/ManageHousehold';
import { useHouseholdMenuActions } from '@/modules/household/hooks/useHouseholdMenuActions';
import { HmisEnums } from '@/types/gqlEnums';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  household: HouseholdFieldsFragment;
  project: ManageHouseholdProject;
  currentDashboardEnrollmentId?: string;
  refetchHousehold: any;
  loading?: boolean;
  canEdit?: boolean;
}

//rename to HouseholdMemberTable
const EditHouseholdMemberTable = ({
  household,
  project,
  refetchHousehold,
  currentDashboardEnrollmentId,
  loading,
  canEdit,
}: Props) => {
  const currentMembers = useMemo(
    () =>
      sortHouseholdMembers(
        household.householdClients,
        currentDashboardEnrollmentId
      ),
    [household, currentDashboardEnrollmentId]
  );

  // client to highlight for relationship input
  // const [highlight, setHighlight] = useState<string[]>([]);

  // TODO ADD: MCI ID and Unit Assignment
  const columns = useMemo(() => {
    const anyExited = household.householdClients.find(
      (hc) => !!hc.enrollment.exitDate
    );

    return [
      HOUSEHOLD_MEMBER_COLUMNS.clientName({
        currentEnrollmentId: currentDashboardEnrollmentId,
        linkToProfile: !!currentDashboardEnrollmentId,
      }),
      // HOUSEHOLD_MEMBER_COLUMNS.enrollmentPeriod,
      HOUSEHOLD_MEMBER_COLUMNS.entryDate,
      // TODO ADD: ENROLLMENT STATUS
      ...(anyExited ? [HOUSEHOLD_MEMBER_COLUMNS.exitDate] : []),

      {
        header: (
          <Tooltip title='Head of Household' placement='top' arrow>
            <Box sx={{ width: 'fit-content' }}>HoH</Box>
          </Tooltip>
        ),
        key: 'HoH',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.enrollment.relationshipToHoH ===
            RelationshipToHoH.SelfHeadOfHousehold && <CheckIcon />,
      },
      {
        header: 'Rel. to HoH',
        width: '25%',
        key: 'relationship',
        // TODO move to menu action modal
        render: (hc: HouseholdClientFieldsFragment) => (
          <HmisEnum
            value={hc.relationshipToHoH}
            enumMap={HmisEnums.RelationshipToHoH}
          />
          // <RelationshipToHoHInput
          //   variant='excludeHoh'
          //   enrollmentId={hc.enrollment.id}
          //   enrollmentLockVersion={hc.enrollment.lockVersion}
          //   relationshipToHoH={hc.relationshipToHoH}
          //   onClose={() =>
          //     setHighlight((old) => old.filter((id) => id !== hc.client.id))
          //   }
          //   textInputProps={{
          //     highlight: highlight.includes(hc.client.id),
          //     inputProps: {
          //       'aria-label': `Relationship to HoH for ${clientBriefName(
          //         hc.client
          //       )}`,
          //     },
          //   }}
          // />
        ),
      },
      HOUSEHOLD_MEMBER_COLUMNS.dobAge,
      HOUSEHOLD_MEMBER_COLUMNS.assignedUnit(currentMembers),
    ];
  }, [
    household.householdClients,
    currentDashboardEnrollmentId,
    currentMembers,
  ]);

  const { getRowSecondaryActionConfigs, actionDialogs, actionLoading } =
    useHouseholdMenuActions({
      household,
      refetchHousehold,
      loading,
      currentDashboardEnrollmentId,
      currentMembers,
      project,
    });

  return (
    <>
      <SsnDobShowContextProvider>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={currentMembers}
          rowName={(row) => clientBriefName(row.client)}
          // TODO : only render actions if user can edit household
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

export default EditHouseholdMemberTable;
