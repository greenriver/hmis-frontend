import { Box, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import GenericTable from '@/components/elements/table/GenericTable';
import { stringifyHousehold } from '@/modules/hmis/hmisUtil';
import { JOIN_HOUSEHOLD_COLUMNS } from '@/modules/household/components/elements/JoinHouseholdSelectClients';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  joiningClients: HouseholdClientFieldsFragment[];
  donorHousehold: HouseholdFieldsFragment;
  receivingHousehold: HouseholdFieldsFragment;
  relationships: Record<string, RelationshipToHoH | null>;
}

const JoinHouseholdReview = ({
  joiningClients,
  donorHousehold,
  receivingHousehold,
  relationships,
}: Props) => {
  const joinedHouseholdClients = useMemo(() => {
    return [
      ...receivingHousehold.householdClients,
      ...joiningClients.map((jc) => {
        return {
          ...jc,
          relationshipToHoH:
            relationships[jc.enrollment.id] ||
            RelationshipToHoH.DataNotCollected,
        };
      }),
    ];
  }, [joiningClients, receivingHousehold.householdClients, relationships]);

  const remainingHouseholdClients = useMemo(() => {
    return donorHousehold.householdClients.filter(
      (hc) => !joiningClients.includes(hc)
    );
  }, [donorHousehold.householdClients, joiningClients]);

  const joining = useMemo(
    () => stringifyHousehold(joiningClients),
    [joiningClients]
  );

  return (
    <Stack gap={2}>
      <Box>
        <Typography variant='overline'>Step 3</Typography>
        <Typography variant='h3'>Review Join</Typography>
      </Box>
      <Typography variant='body1'>
        Check that the joined and remaining household members and details are
        correct
      </Typography>
      <Typography variant='h4'>Joining Household</Typography>
      <Typography variant='body2'>
        The household that {joining} will join
      </Typography>
      <Paper>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={joinedHouseholdClients}
          columns={JOIN_HOUSEHOLD_COLUMNS}
        />
      </Paper>
      {remainingHouseholdClients.length > 0 && (
        <>
          <Typography variant='h4'>Remaining Household</Typography>
          <Typography variant='body2'>
            The household that {joining} will leave
          </Typography>
          <Paper>
            <GenericTable<HouseholdClientFieldsFragment>
              rows={remainingHouseholdClients}
              columns={JOIN_HOUSEHOLD_COLUMNS}
              tableProps={{
                'aria-label': 'Review Join',
              }}
            />
          </Paper>
        </>
      )}
    </Stack>
  );
};

export default JoinHouseholdReview;
