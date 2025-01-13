import { Box, Paper, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import GenericTable from '@/components/elements/table/GenericTable';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  joiningClients: HouseholdClientFieldsFragment[];
  donorHousehold: HouseholdFieldsFragment;
  receivingHousehold: HouseholdFieldsFragment;
  relationships: Record<string, RelationshipToHoH>;
}

const JoinHouseholdReviewJoin = ({
  joiningClients,
  donorHousehold,
  receivingHousehold,
  relationships,
}: Props) => {
  const joinedHouseholdClients = useMemo(() => {
    return [...receivingHousehold.householdClients, ...joiningClients];
  }, [joiningClients, receivingHousehold.householdClients]);

  const remainingHouseholdClients = useMemo(() => {
    return donorHousehold.householdClients.filter(
      (hc) => !joiningClients.includes(hc)
    );
  }, [donorHousehold.householdClients, joiningClients]);

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

      <Typography variant='h4'>Joined Household</Typography>
      <Paper>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={joinedHouseholdClients}
          columns={[
            CLIENT_COLUMNS.name,
            CLIENT_COLUMNS.age,
            {
              header: 'Relationship',
              key: 'relationship',
              // todo @martha - factor definition somewhere common
              render: (hc: HouseholdClientFieldsFragment) =>
                relationships[hc.id] || hc.relationshipToHoH,
            },
            WITH_ENROLLMENT_COLUMNS.entryDate,
            WITH_ENROLLMENT_COLUMNS.exitDate,
            WITH_ENROLLMENT_COLUMNS.enrollmentStatus,
          ]}
        />
      </Paper>
      <Typography variant='h4'>Other Household</Typography>
      <Paper>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={remainingHouseholdClients}
          columns={[
            CLIENT_COLUMNS.name,
            CLIENT_COLUMNS.age,
            // todo @martha - consistent cols
            WITH_ENROLLMENT_COLUMNS.entryDate,
            WITH_ENROLLMENT_COLUMNS.exitDate,
            WITH_ENROLLMENT_COLUMNS.enrollmentStatus,
          ]}
        />
      </Paper>
    </Stack>
  );
};

export default JoinHouseholdReviewJoin;
