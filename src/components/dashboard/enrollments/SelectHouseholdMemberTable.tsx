import { FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { sortBy } from 'lodash-es';
import { SyntheticEvent, useMemo } from 'react';

import GenericTable from '@/components/elements/GenericTable';
import GenericSelect from '@/components/elements/input/GenericSelect';
import { clientName, dob, age, maskedSSN } from '@/modules/hmis/hmisUtil';
import { RelationshipToHoHEnum } from '@/types/gqlEnums';
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

const SelectHouseholdMemberTable = ({
  recentMembers,
  members,
  setMembers,
}: {
  recentMembers: ClientFieldsFragment[];
  members: Record<string, RelationshipToHoH | null>;
  setMembers: React.Dispatch<
    React.SetStateAction<Record<string, RelationshipToHoH | null>>
  >;
}) => {
  const relationshipToHohOptions = useMemo(() => {
    const options = Object.entries(RelationshipToHoHEnum).map(
      ([value, label]) =>
        ({
          value,
          label,
        } as { value: RelationshipToHoH; label: string })
    );
    return sortBy(options, ['label']);
  }, []);

  if (recentMembers.length === 0) return null;

  return (
    <GenericTable<ClientFieldsFragment>
      rows={recentMembers || []}
      columns={[
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
        {
          header: 'Relationship To HoH',
          width: '30%',
          render: (client) => (
            <GenericSelect<
              { value: RelationshipToHoH; label: string },
              false,
              false
            >
              options={relationshipToHohOptions}
              disabled={!(client.id in members)}
              textInputProps={
                !(client.id in members)
                  ? { placeholder: 'Not Included' }
                  : { placeholder: '(99) Data not collected' }
              }
              value={
                members[client.id]
                  ? relationshipToHohOptions.find(
                      ({ value }) => value === members[client.id]
                    )
                  : null
              }
              size='small'
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
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  <Typography variant='body2'>{option.label}</Typography>
                </li>
              )}
              fullWidth
            />
          ),
        },
      ]}
    />
  );
};

export default SelectHouseholdMemberTable;
