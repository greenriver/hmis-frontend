import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { SyntheticEvent, useMemo } from 'react';

import RelationshipToHohSelect from './RelationshipToHohSelect';

import GenericTable, { Columns } from '@/components/elements/GenericTable';
import { clientName, dob, age, maskedSSN } from '@/modules/hmis/hmisUtil';
import { ClientFieldsFragment, RelationshipToHoH } from '@/types/gqlTypes';

const IncludeMemberSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (event: SyntheticEvent, checked: boolean) => void;
}) => {
  return (
    <FormControlLabel
      checked={checked}
      onChange={onChange}
      control={
        <Switch inputProps={{ 'aria-label': 'controlled' }} size='small' />
      }
      label={
        <Typography variant='body2'>
          {checked ? 'Included' : 'Not Included'}
        </Typography>
      }
    />
  );
};

const defaultColumns: Columns<ClientFieldsFragment>[] = [
  {
    header: 'Name',
    render: (client) => clientName(client),
  },
  {
    header: 'Last 4 Social',
    render: (client) => maskedSSN(client),
  },
  {
    header: 'DOB / Age',
    render: (client) =>
      client.dob && (
        <Stack direction='row' spacing={1}>
          <span>{dob(client)}</span>
          <span>{`(${age(client)})`}</span>
        </Stack>
      ),
  },
];

/**
 * List of clients that have been previously enrolled with client, with a toggle to add them to enrollment
 */
const AssociatedHouseholdMembers = ({
  recentMembers,
  members,
  setMembers,
  hideRelationshipToHoH = false,
}: {
  recentMembers: ClientFieldsFragment[];
  members: Record<string, RelationshipToHoH | null>;
  setMembers: React.Dispatch<
    React.SetStateAction<Record<string, RelationshipToHoH | null>>
  >;
  hideRelationshipToHoH?: boolean;
}) => {
  const columns: Columns<ClientFieldsFragment>[] = useMemo(() => {
    return [
      ...defaultColumns,
      {
        header: 'Add to Enrollment',
        render: (client) => (
          <IncludeMemberSwitch
            checked={client.id in members}
            onChange={(_, checked) => {
              setMembers((current) => {
                const copy = { ...current };
                if (!checked) {
                  delete copy[client.id];
                } else {
                  copy[client.id] = null;
                }
                return copy;
              });
            }}
          />
        ),
      },
      ...(hideRelationshipToHoH
        ? []
        : [
            {
              header: 'Relationship To HoH',
              width: '30%',
              render: (client: ClientFieldsFragment) => (
                <RelationshipToHohSelect
                  disabled={!(client.id in members)}
                  value={members[client.id]}
                  onChange={(_, selected) => {
                    setMembers((current) => {
                      const copy = { ...current };
                      if (!selected) {
                        copy[client.id] = null;
                      } else {
                        copy[client.id] = selected.value;
                      }
                      return copy;
                    });
                  }}
                />
              ),
            },
          ]),
    ];
  }, [hideRelationshipToHoH, members, setMembers]);

  if (recentMembers.length === 0) return null;
  return (
    <GenericTable<ClientFieldsFragment>
      rows={recentMembers || []}
      columns={columns}
    />
  );
};

export default AssociatedHouseholdMembers;
