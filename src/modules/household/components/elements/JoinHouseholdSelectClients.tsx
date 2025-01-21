import { InfoOutlined } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import ClientAlertStack from '@/modules/clientAlerts/components/ClientAlertStack';
import useClientAlerts from '@/modules/clientAlerts/hooks/useClientAlerts';
import { clientBriefName, sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import { HOUSEHOLD_CLIENT_COLUMNS } from '@/modules/projects/components/tables/ProjectHouseholdsTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

export const JOIN_HOUSEHOLD_COLUMNS: ColumnDef<HouseholdClientFieldsFragment>[] =
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
  setSelectedClients: Dispatch<SetStateAction<HouseholdClientFieldsFragment[]>>;
  receivingHohName?: string;
}

const JoinHouseholdSelectClients = ({
  donorHousehold,
  selectedClients,
  setSelectedClients,
  receivingHohName,
}: Props) => {
  const donorHoh = useMemo(
    () =>
      donorHousehold.householdClients.find(
        (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      ),
    [donorHousehold.householdClients]
  );
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
      // If the HoH from the donor household is selected, all other hh members must be selected.
      // (Can't leave behind a household without a HoH)
      if (donorHoh && clientIds.includes(donorHoh.id)) {
        setSelectedClients(
          sortHouseholdMembers(donorHousehold.householdClients)
        );
      } else {
        setSelectedClients(
          sortHouseholdMembers(
            donorHousehold.householdClients.filter((hc) =>
              clientIds.includes(hc.id)
            )
          )
        );
      }
    },
    [donorHousehold.householdClients, donorHoh, setSelectedClients]
  );

  const isRowSelectable = useCallback(
    (row: HouseholdClientFieldsFragment) => {
      if (donorHoh && selectedClientIds.includes(donorHoh.id)) {
        // Visually disable de-selecting other clients if the HoH is selected
        // (This is also functionally disabled by the logic in setSelectedClientIds above)
        return row.id === donorHoh.id;
      }

      return true;
    },
    [donorHoh, selectedClientIds]
  );

  const { clientAlerts } = useClientAlerts({
    household: donorHousehold,
    showClientName: true,
  });

  return (
    <Stack gap={2}>
      <Box>
        <Typography variant='overline'>Step 1</Typography>
        <Typography variant='h3'>Select Clients</Typography>
      </Box>
      <Typography variant='body1'>
        Select which clients you would like to join{' '}
        {receivingHohName ? `${receivingHohName}’s` : 'this'} household.
      </Typography>
      {<ClientAlertStack clientAlerts={clientAlerts} />}
      {donorHoh &&
        selectedClientIds.includes(donorHoh.id) &&
        donorHousehold.householdSize > 1 && (
          <Alert
            color='info'
            icon={<InfoOutlined />}
            action={
              <ButtonLink
                variant='contained'
                color='grayscale'
                to={generatePath(EnrollmentDashboardRoutes.EDIT_HOUSEHOLD, {
                  clientId: donorHoh.client.id,
                  enrollmentId: donorHoh.enrollment.id,
                })}
              >
                Edit Household
              </ButtonLink>
            }
          >
            <AlertTitle>Head of Household Selected</AlertTitle>
            If the current Head of Household is selected, all members must also
            join. Edit {clientBriefName(donorHoh.client)}’s household and select
            a different Head of Household if this is not your intention.
          </Alert>
        )}
      <Paper>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={donorHouseholdMembers}
          columns={JOIN_HOUSEHOLD_COLUMNS}
          selectable={'checkbox'}
          selected={selectedClientIds}
          onChangeSelectedRowIds={setSelectedClientIds}
          isRowSelectable={isRowSelectable}
          tableProps={{
            'aria-label': 'Select Clients for Join',
          }}
        />
      </Paper>
    </Stack>
  );
};

export default JoinHouseholdSelectClients;
