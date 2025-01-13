import { Box, Paper, Stack, Typography } from '@mui/material';
import GenericTable from '@/components/elements/table/GenericTable';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import RelationshipToHohSelect from '@/modules/household/components/elements/RelationshipToHohSelect';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  joiningClients: HouseholdClientFieldsFragment[];
  relationships: Record<string, RelationshipToHoH>;
  updateRelationship: (
    householdClientId: string,
    relationship: RelationshipToHoH | null
  ) => void;
  receivingHousehold: HouseholdFieldsFragment;
}

const JoinHouseholdAddRelationships = ({
  joiningClients,
  relationships,
  updateRelationship,
  receivingHousehold,
}: Props) => {
  // todo @martha - updated entry dates

  return (
    <Stack gap={2}>
      <Box>
        <Typography variant='overline'>Step 2</Typography>
        <Typography variant='h3'>Add Relationships</Typography>
      </Box>
      <Typography variant='body1'>
        Update joining clients' relationship to [HoH]
        {/*  todo @martha - new HoH*/}
      </Typography>
      <Paper>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={[...receivingHousehold.householdClients, ...joiningClients]}
          // todo @martha - remove exit date? (the enrollment is, probably, unexited? or it could be exited...)
          columns={[
            CLIENT_COLUMNS.name,
            CLIENT_COLUMNS.age,
            {
              header: 'Relationship',
              key: 'relationship',
              render: (hc: HouseholdClientFieldsFragment) => {
                if (joiningClients.includes(hc)) {
                  return (
                    <RelationshipToHohSelect
                      value={relationships[hc.id] || null}
                      onChange={(_event, selected) => {
                        updateRelationship(hc.id, selected?.value || null);
                      }}
                      textInputProps={{
                        highlight: true,
                        placeholder: 'Select Relationship',
                        inputProps: {
                          'aria-label': `Relationship to HoH for ${clientBriefName(
                            hc.client
                          )}`,
                        },
                      }}
                    />
                  );
                } else {
                  return hc.relationshipToHoH; // todo @martha - in an enum
                }
              },
            },
            WITH_ENROLLMENT_COLUMNS.entryDate,
            WITH_ENROLLMENT_COLUMNS.exitDate,
            WITH_ENROLLMENT_COLUMNS.enrollmentStatus,
          ]}
        />
      </Paper>
    </Stack>
  );
};

export default JoinHouseholdAddRelationships;
