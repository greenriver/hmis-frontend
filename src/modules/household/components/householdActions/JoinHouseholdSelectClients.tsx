import { InfoOutlined } from '@mui/icons-material';
import { Alert, AlertTitle, Typography } from '@mui/material';

import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import ClientAlertStack from '@/modules/clientAlerts/components/ClientAlertStack';
import useClientAlerts from '@/modules/clientAlerts/hooks/useClientAlerts';
import { clientBriefName, sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import SelectClientsStep from '@/modules/household/components/householdActions/SelectClientsStep';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  donorHousehold: HouseholdFieldsFragment;
  selectedClients: HouseholdClientFieldsFragment[];
  setSelectedClients: Dispatch<SetStateAction<HouseholdClientFieldsFragment[]>>;
  receivingHohName?: string;
}

const JoinHouseholdSelectClients = ({
  donorHousehold,
  selectedClients,
  setSelectedClients: setSelectedClientsProp,
  receivingHohName,
}: Props) => {
  const donorHoh = useMemo(
    () =>
      donorHousehold.householdClients.find(
        (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      ),
    [donorHousehold.householdClients]
  );

  const isHohSelected = useMemo(() => {
    return donorHoh && selectedClients.includes(donorHoh);
  }, [donorHoh, selectedClients]);

  // This is a controlled component, so the selected clients state is stored a level above,
  // but here hijack the selection logic in order to select *all* members when HoH is selected.
  // (Can't leave behind a household without a HoH)
  const setSelectedClients = useCallback(
    (clients: HouseholdClientFieldsFragment[]) => {
      // If the HoH from the donor household is selected, all other hh members must be selected.
      if (donorHoh && clients.includes(donorHoh)) {
        setSelectedClientsProp(
          sortHouseholdMembers(donorHousehold.householdClients)
        );
      } else {
        setSelectedClientsProp(clients);
      }
    },
    [donorHoh, setSelectedClientsProp, donorHousehold.householdClients]
  );

  const isRowSelectable = useCallback(
    (row: HouseholdClientFieldsFragment) => {
      if (donorHoh && isHohSelected) {
        // Visually disable de-selecting other clients if the HoH is selected
        // (This is also functionally disabled by the logic in setSelectedClientIds above)
        return row.id === donorHoh.id;
      }

      return true;
    },
    [donorHoh, isHohSelected]
  );

  const { clientAlerts } = useClientAlerts({
    household: donorHousehold,
    showClientName: true,
  });

  return (
    <SelectClientsStep
      clients={donorHousehold.householdClients}
      selectedClients={selectedClients}
      setSelectedClients={setSelectedClients}
      isRowSelectable={isRowSelectable}
    >
      <Typography variant='body1'>
        Select which clients you would like to join{' '}
        {receivingHohName ? `${receivingHohName}’s` : 'this'} household.
      </Typography>
      {<ClientAlertStack clientAlerts={clientAlerts} />}
      {donorHoh && isHohSelected && donorHousehold.householdSize > 1 && (
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
          join. Edit {clientBriefName(donorHoh.client)}’s household and select a
          different Head of Household if this is not your intention.
        </Alert>
      )}
    </SelectClientsStep>
  );
};

export default JoinHouseholdSelectClients;
