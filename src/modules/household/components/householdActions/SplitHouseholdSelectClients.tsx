import { Typography } from '@mui/material';

import { Dispatch, SetStateAction, useMemo } from 'react';
import { clientBriefName, findHohOrRep } from '@/modules/hmis/hmisUtil';
import SelectClientsStep from '@/modules/household/components/householdActions/SelectClientsStep';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  donorHousehold: HouseholdFieldsFragment;
  selectedClients: HouseholdClientFieldsFragment[];
  setSelectedClients: Dispatch<SetStateAction<HouseholdClientFieldsFragment[]>>;
}

const SplitHouseholdSelectClients = ({
  donorHousehold,
  selectedClients,
  setSelectedClients,
}: Props) => {
  const donorHoh = useMemo(
    () => findHohOrRep(donorHousehold.householdClients || []),
    [donorHousehold.householdClients]
  );
  return (
    <SelectClientsStep
      donorHousehold={donorHousehold}
      selectedClients={selectedClients}
      setSelectedClients={setSelectedClients}
      isRowSelectable={(row: HouseholdClientFieldsFragment) =>
        row.relationshipToHoH !== RelationshipToHoH.SelfHeadOfHousehold
      }
      getRowSelectDisabledReason={(row: HouseholdClientFieldsFragment) =>
        row.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
          ? 'Head of Household may not be split'
          : undefined
      }
    >
      <Typography variant='body1'>
        Select which clients from {clientBriefName(donorHoh.client)}’s household
        to split into a new household.
      </Typography>
    </SelectClientsStep>
  );
};

export default SplitHouseholdSelectClients;
