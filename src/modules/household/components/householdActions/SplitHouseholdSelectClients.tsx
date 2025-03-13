import { Typography } from '@mui/material';
import { useMemo } from 'react';
import ClientAlertStack from '@/modules/clientAlerts/components/ClientAlertStack';
import useClientAlerts from '@/modules/clientAlerts/hooks/useClientAlerts';
import SelectClientsStep from '@/modules/household/components/householdActions/SelectClientsStep';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  donorHousehold: HouseholdFieldsFragment;
  selectedClients: HouseholdClientFieldsFragment[];
  setSelectedClients: (clients: HouseholdClientFieldsFragment[]) => void;
}

const SplitHouseholdSelectClients = ({
  donorHousehold,
  selectedClients,
  setSelectedClients,
}: Props) => {
  const { clientAlerts } = useClientAlerts({
    household: donorHousehold,
    showClientName: true,
  });

  // You can't split out the HoH, so exclude them from the list of selectable clients
  const clients = useMemo(
    () =>
      donorHousehold.householdClients.filter((hc) => {
        return hc.relationshipToHoH !== RelationshipToHoH.SelfHeadOfHousehold;
      }),
    [donorHousehold.householdClients]
  );

  return (
    <SelectClientsStep
      clients={clients}
      selectedClients={selectedClients}
      setSelectedClients={setSelectedClients}
    >
      <Typography variant='body1'>
        Select which clients to split into a new household.
      </Typography>
      {<ClientAlertStack clientAlerts={clientAlerts} />}
    </SelectClientsStep>
  );
};

export default SplitHouseholdSelectClients;
