import {
  FormControlLabel,
  Radio,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { SyntheticEvent } from 'react';

import AssociatedHouseholdMembers from './AssociatedHouseholdMembers';
import RelationshipToHohSelect from './RelationshipToHohSelect';

import { clientName } from '@/modules/hmis/hmisUtil';
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
      control={<Switch inputProps={{ 'aria-label': 'controlled' }} />}
      componentsProps={{ typography: { variant: 'body2' } }}
      label={checked ? 'Included' : 'Not Included'}
    />
  );
};

/**
 * Quickly add household members to a new enrollment
 */
const QuickAddHouseholdMembers = ({
  clientId,
  recentMembers,
  members,
  setMembers,
}: {
  clientId: string;
  recentMembers: ClientFieldsFragment[];
  members: Record<string, RelationshipToHoH | null>;
  setMembers: React.Dispatch<
    React.SetStateAction<Record<string, RelationshipToHoH | null>>
  >;
}) => {
  const onToggleMemberForClient =
    (client: ClientFieldsFragment) => (_: SyntheticEvent, checked: boolean) =>
      setMembers((current) => {
        const copy = { ...current };
        if (!checked) {
          if (copy[client.id] === RelationshipToHoH.SelfHeadOfHousehold) {
            copy[clientId] = RelationshipToHoH.SelfHeadOfHousehold;
          }
          delete copy[client.id];
        } else {
          copy[client.id] = null;
        }
        return copy;
      });

  const columns = [
    {
      header: '',
      key: 'HoH',
      width: '1%',
      render: (client: ClientFieldsFragment) => (
        <FormControlLabel
          disabled={!(client.id in members)}
          checked={members[client.id] === RelationshipToHoH.SelfHeadOfHousehold}
          control={<Radio />}
          label='HoH'
          componentsProps={{ typography: { variant: 'body2' } }}
          onChange={(_, checked) => {
            if (!checked) return;
            setMembers((current) => {
              const copy = { ...current };
              Object.keys(copy).forEach((id) => {
                if (copy[id] === RelationshipToHoH.SelfHeadOfHousehold) {
                  copy[id] = null;
                }
                copy[client.id] = RelationshipToHoH.SelfHeadOfHousehold;
              });
              return copy;
            });
          }}
        />
      ),
    },
    {
      header: 'Relationship to HoH',
      key: 'relationship',
      width: '25%',
      render: (client: ClientFieldsFragment) => (
        <RelationshipToHohSelect
          disabled={!(client.id in members)}
          value={members[client.id] || null}
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
    {
      header: '',
      key: 'add',
      width: '15%',
      render: (client: ClientFieldsFragment) =>
        client.id !== clientId && (
          <IncludeMemberSwitch
            checked={client.id in members}
            onChange={onToggleMemberForClient(client)}
          />
        ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant='body2'>
          Use the toggles to enroll previously associated clients in the same
          household as <b>{clientName(recentMembers[0])}</b>.
        </Typography>
        <Typography variant='body2'>
          Additional household members can be added at a later step.
        </Typography>
      </Stack>
      <AssociatedHouseholdMembers
        recentMembers={recentMembers}
        rowSx={(client) => ({
          backgroundColor: !(client.id in members) ? '#f8f8f8' : undefined,
          borderLeft:
            client.id === clientId
              ? (theme) => `3px solid ${theme.palette.secondary.main}`
              : undefined,
        })}
        tableProps={{ sx: { border: '1px solid #eee', borderRadius: 30 } }}
        additionalColumns={columns}
      />
    </Stack>
  );
};
export default QuickAddHouseholdMembers;
