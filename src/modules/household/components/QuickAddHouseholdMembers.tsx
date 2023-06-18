import {
  FormControlLabel,
  Radio,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { SyntheticEvent, useState } from 'react';

import { RecentHouseholdMember } from '../types';

import AssociatedHouseholdMembers from './AssociatedHouseholdMembers';
import RelationshipToHohSelect from './RelationshipToHohSelect';

import { ColumnDef } from '@/components/elements/table/types';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { RelationshipToHoH } from '@/types/gqlTypes';

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
  recentMembers: RecentHouseholdMember[];
  members: Record<string, RelationshipToHoH | null>;
  setMembers: React.Dispatch<
    React.SetStateAction<Record<string, RelationshipToHoH | null>>
  >;
}) => {
  const [highlight, setHighlight] = useState<string[]>([]);
  const onToggleMemberForClient =
    (memberClientId: string) => (_: SyntheticEvent, checked: boolean) => {
      setMembers((current) => {
        const copy = { ...current };
        if (!checked) {
          if (copy[memberClientId] === RelationshipToHoH.SelfHeadOfHousehold) {
            copy[clientId] = RelationshipToHoH.SelfHeadOfHousehold;
          }
          delete copy[memberClientId];
        } else {
          copy[memberClientId] = null;
        }
        return copy;
      });
      if (!checked) {
        // if unchecked, they shouldnt be highlighted again when rechecked
        setHighlight((members) =>
          members.filter((id) => id !== memberClientId)
        );
      }
    };

  const columns: ColumnDef<RecentHouseholdMember>[] = [
    {
      header: '',
      key: 'HoH',
      width: '1%',
      render: ({ client }) => (
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
              });
              copy[client.id] = RelationshipToHoH.SelfHeadOfHousehold;
              return copy;
            });
            setHighlight(Object.keys(members));
          }}
        />
      ),
    },
    {
      header: 'Relationship to HoH',
      key: 'relationship',
      width: '120px',
      render: ({ client }) => (
        <RelationshipToHohSelect
          disabled={!(client.id in members)}
          value={members[client.id] || null}
          onClose={() =>
            setHighlight((old) => old.filter((id) => id !== client.id))
          }
          textInputProps={{
            highlight: client.id in members && highlight.includes(client.id),
          }}
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
      minWidth: '180px',
      render: ({ client }) =>
        client.id !== clientId && (
          <IncludeMemberSwitch
            checked={client.id in members}
            onChange={onToggleMemberForClient(client.id)}
          />
        ),
    },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant='body2'>
          Use the toggles to enroll previously associated clients in the same
          household as <b>{clientBriefName(recentMembers[0].client)}</b>.
        </Typography>
        <Typography variant='body2'>
          Additional household members can be added at a later step.
        </Typography>
      </Stack>
      <AssociatedHouseholdMembers
        recentMembers={recentMembers}
        rowSx={(hc) => ({
          backgroundColor: !(hc.client.id in members) ? '#f8f8f8' : undefined,
          borderLeft:
            hc.client.id === clientId
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
