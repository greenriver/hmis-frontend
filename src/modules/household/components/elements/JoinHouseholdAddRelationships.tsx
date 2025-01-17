import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import React, { useId } from 'react';
import GenericTable from '@/components/elements/table/GenericTable';
import ClientName from '@/modules/client/components/ClientName';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import RelationshipToHohSelect from '@/modules/household/components/elements/RelationshipToHohSelect';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import {
  asClient,
  CLIENT_COLUMNS,
} from '@/modules/search/components/ClientSearch';
import { HmisEnums } from '@/types/gqlEnums';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  joiningClients: HouseholdClientFieldsFragment[];
  relationships: Record<string, RelationshipToHoH | null>;
  updateRelationship: (
    enrollmentId: string,
    relationship: RelationshipToHoH | null
  ) => void;
  receivingHousehold: HouseholdFieldsFragment;
  receivingHohName?: string;
}

const JoinHouseholdAddRelationships = ({
  joiningClients,
  relationships,
  updateRelationship,
  receivingHousehold,
  receivingHohName,
}: Props) => {
  const relationshipHeaderId = useId();

  return (
    <Stack gap={2}>
      <Box>
        <Typography variant='overline'>Step 2</Typography>
        <Typography variant='h3'>Add Relationships</Typography>
      </Box>
      <Typography variant='body1'>
        Update joining clients' relationships{' '}
        {receivingHohName && <>to {receivingHohName}</>}
        {/*  todo @martha - add warning here about entry dates. see design ? */}
      </Typography>
      <Paper>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={[...receivingHousehold.householdClients, ...joiningClients]}
          columns={[
            {
              ...CLIENT_COLUMNS.name,
              render: (client) => (
                <Stack direction='row' gap={1}>
                  <ClientName client={asClient(client)} />
                  {joiningClients.includes(client) && (
                    <Chip label='New' size='small' variant='outlined' />
                  )}
                </Stack>
              ),
              sticky: 'left',
            },
            CLIENT_COLUMNS.age,
            {
              header: (
                <RequiredLabel
                  text='Relationship'
                  TypographyProps={{
                    fontWeight: 'bold',
                    id: relationshipHeaderId,
                  }}
                  required={true}
                />
              ),
              key: 'relationship',
              render: (hc: HouseholdClientFieldsFragment) => {
                if (joiningClients.includes(hc)) {
                  return (
                    <RelationshipToHohSelect
                      aria-labelledby={`client-${hc.id} ${relationshipHeaderId}`}
                      value={relationships[hc.enrollment.id] || null}
                      onChange={(_event, selected) => {
                        updateRelationship(
                          hc.enrollment.id,
                          selected?.value || null
                        );
                      }}
                      textInputProps={{
                        warnIfEmptyTreatment: !relationships[hc.enrollment.id],
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
                  return (
                    <HmisEnum
                      key={hc.id}
                      value={hc.relationshipToHoH}
                      enumMap={HmisEnums.RelationshipToHoH}
                      whiteSpace='nowrap'
                    />
                  );
                }
              },
              tableCellProps: { sx: { py: 0 } },
            },
            WITH_ENROLLMENT_COLUMNS.entryDate,
            WITH_ENROLLMENT_COLUMNS.enrollmentStatus,
          ]}
        />
      </Paper>
    </Stack>
  );
};

export default JoinHouseholdAddRelationships;
