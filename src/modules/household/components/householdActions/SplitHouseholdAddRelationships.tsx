import { Alert, AlertTitle, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { sortHouseholdMembers } from '@/modules/hmis/hmisUtil';
import AddRelationshipsStep from '@/modules/household/components/householdActions/AddRelationshipsStep';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  householdClients: HouseholdClientFieldsFragment[];
  relationships: Record<string, RelationshipToHoH | null>;
  updateRelationship: (
    enrollmentId: string,
    relationship: RelationshipToHoH | null
  ) => void;
  hohCount: number;
}

const SplitHouseholdAddRelationships = ({
  householdClients,
  relationships,
  updateRelationship,
  hohCount,
}: Props) => {
  const sortedHouseholdClients = useMemo(
    () => sortHouseholdMembers(householdClients),
    [householdClients]
  );
  const selectedRelationshipsCount = useMemo(
    () => Object.values(relationships).filter((r) => !!r).length,
    [relationships]
  );
  const showHohAlert = useMemo(
    () =>
      // Only show the alert if all relationships have been filled in and something is still wrong
      selectedRelationshipsCount === householdClients.length &&
      (hohCount === 0 || hohCount > 1),
    [hohCount, householdClients.length, selectedRelationshipsCount]
  );

  return (
    <AddRelationshipsStep
      newClients={sortedHouseholdClients}
      showNewIndicator={false}
      enableSelectingHoh={true}
      relationships={relationships}
      updateRelationship={updateRelationship}
    >
      <Typography variant='body1'>
        Select a new head of household and update all relationships
      </Typography>
      {showHohAlert && (
        <Alert severity='warning'>
          <AlertTitle>Invalid Inputs</AlertTitle>
          {hohCount === 0 && 'Missing Head of Household. '}
          {hohCount > 1 && 'Multiple Heads of Household selected. '}
          There must be one Head of Household selected.
        </Alert>
      )}
    </AddRelationshipsStep>
  );
};

export default SplitHouseholdAddRelationships;
