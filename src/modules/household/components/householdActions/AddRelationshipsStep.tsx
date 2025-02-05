import { Chip, Paper, Stack } from '@mui/material';
import React, { ReactNode, useId } from 'react';
import GenericTable from '@/components/elements/table/GenericTable';
import ClientName from '@/modules/client/components/ClientName';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import RelationshipToHohSelect from '@/modules/household/components/elements/RelationshipToHohSelect';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import {
  asClient,
  CLIENT_COLUMNS,
} from '@/modules/search/components/ClientSearch';
import { HmisEnums } from '@/types/gqlEnums';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  existingClients?: HouseholdClientFieldsFragment[];
  newClients: HouseholdClientFieldsFragment[];
  relationships: Record<string, RelationshipToHoH | null>;
  updateRelationship: (
    enrollmentId: string,
    relationship: RelationshipToHoH | null
  ) => void;
  enableSelectingHoh: boolean;
  showNewIndicator?: boolean;
  children?: ReactNode;
}

const AddRelationshipsStep = ({
  existingClients,
  newClients,
  relationships,
  updateRelationship,
  enableSelectingHoh,
  showNewIndicator,
  children,
}: Props) => {
  const relationshipHeaderId = useId();

  return (
    <Stack gap={2}>
      {children}
      <Paper>
        <GenericTable<HouseholdClientFieldsFragment>
          rows={[...(existingClients || []), ...newClients]}
          columns={[
            {
              ...CLIENT_COLUMNS.name,
              render: (client) => (
                <Stack direction='row' gap={1}>
                  <ClientName client={asClient(client)} />
                  {showNewIndicator && newClients.includes(client) && (
                    <Chip label='New' size='small' variant='outlined' />
                  )}
                </Stack>
              ),
              sticky: 'left',
              tableCellProps: (client) => {
                return {
                  // enables using aria-labelledby on inputs in this row
                  id: `client-${client.id}`,
                };
              },
            },
            CLIENT_COLUMNS.age,
            {
              header: (
                <RequiredLabel
                  text='Relationship'
                  TypographyProps={{
                    fontWeight: 'bold',
                  }}
                  required={true}
                />
              ),
              headerCellProps: {
                id: relationshipHeaderId,
              },
              key: 'relationship',
              render: (hc: HouseholdClientFieldsFragment) => {
                if (newClients.includes(hc)) {
                  return (
                    <RelationshipToHohSelect
                      variant={enableSelectingHoh ? 'includeHoh' : 'excludeHoh'}
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
                          'aria-labelledby': `client-${hc.id} ${relationshipHeaderId}`,
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
          tableProps={{
            'aria-label': 'Add Relationships',
          }}
        />
      </Paper>
    </Stack>
  );
};

export default AddRelationshipsStep;
