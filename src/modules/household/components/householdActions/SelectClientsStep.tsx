import { Paper, Stack } from '@mui/material';

import { ReactNode, useCallback, useMemo } from 'react';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import { sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import { HOUSEHOLD_CLIENT_COLUMNS } from '@/modules/projects/components/tables/ProjectHouseholdsTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
} from '@/types/gqlTypes';

export const MANAGE_HOUSEHOLD_COLUMNS: ColumnDef<HouseholdClientFieldsFragment>[] =
  [
    { ...CLIENT_COLUMNS.name, sticky: 'left' },
    CLIENT_COLUMNS.age,
    HOUSEHOLD_CLIENT_COLUMNS.relationship,
    WITH_ENROLLMENT_COLUMNS.entryDate,
    WITH_ENROLLMENT_COLUMNS.enrollmentStatus,
  ];

interface Props {
  donorHousehold: HouseholdFieldsFragment;
  selectedClients: HouseholdClientFieldsFragment[];
  setSelectedClients: (clients: HouseholdClientFieldsFragment[]) => void;
  children?: ReactNode;
  isRowSelectable?: (client: HouseholdClientFieldsFragment) => boolean;
  getRowSelectDisabledReason?: (
    client: HouseholdClientFieldsFragment
  ) => string | undefined;
}

const SelectClientsStep = ({
  donorHousehold,
  selectedClients,
  setSelectedClients,
  isRowSelectable,
  getRowSelectDisabledReason,
  children,
}: Props) => {
  const donorHouseholdMembers = useMemo(
    () => sortHouseholdMembers(donorHousehold.householdClients),
    [donorHousehold.householdClients]
  );

  // Selection is controlled, so the selection state is stored in the parent.
  // Here, translate the list of selected HouseholdClients from the parent to a list of row IDs for GenericTable.
  const selectedClientIds = useMemo(
    () => selectedClients.map((hc) => hc.id),
    [selectedClients]
  );

  // .. and here, translate back again
  const setSelectedClientIds = useCallback(
    (clientIds: readonly string[]) => {
      setSelectedClients(
        sortHouseholdMembers(
          donorHousehold.householdClients.filter((hc) =>
            clientIds.includes(hc.id)
          )
        )
      );
    },
    [donorHousehold.householdClients, setSelectedClients]
  );

  return (
    <Stack gap={2}>
      {children}
      <Paper>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={donorHouseholdMembers}
          columns={MANAGE_HOUSEHOLD_COLUMNS}
          selectable={'checkbox'}
          selected={selectedClientIds}
          onChangeSelectedRowIds={setSelectedClientIds}
          isRowSelectable={isRowSelectable}
          getRowSelectDisabledReason={getRowSelectDisabledReason}
          tableProps={{ 'aria-label': 'Select Clients' }}
        />
      </Paper>
    </Stack>
  );
};

export default SelectClientsStep;
