import { Typography } from '@mui/material';
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

  return (
    <SelectClientsStep
      clients={donorHousehold.householdClients.filter(
        (hc) => hc.relationshipToHoH !== RelationshipToHoH.SelfHeadOfHousehold
      )}
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
