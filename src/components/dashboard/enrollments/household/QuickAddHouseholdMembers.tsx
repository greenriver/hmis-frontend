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

// import MiniClientSearch from '@/modules/search/components/MiniClientSearch';

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
  return (
    <Stack spacing={3}>
      <Typography variant='body2'>
        Use the toggles to include clients that have been previously enrolled in
        the same household as <b>{clientName(recentMembers[0])}</b>.
      </Typography>
      <AssociatedHouseholdMembers
        recentMembers={recentMembers}
        hideHeaders
        rowSx={(client) =>
          !(client.id in members) ? { backgroundColor: '#f8f8f8' } : {}
        }
        tableProps={{ sx: { border: '1px solid #eee', borderRadius: 30 } }}
        additionalColumns={[
          {
            header: '',
            key: 'HoH',
            render: (client) => (
              <FormControlLabel
                disabled={!(client.id in members)}
                checked={
                  members[client.id] === RelationshipToHoH.SelfHeadOfHousehold
                }
                control={<Radio />}
                label='HoH'
                componentsProps={{ typography: { variant: 'body2' } }}
                onChange={(_, checked) => {
                  console.log(checked);
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
            header: '',
            key: 'relationship',
            width: '20%',
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
            render: (client) =>
              client.id !== clientId && (
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
        ]}
      />
    </Stack>
  );
};
export default QuickAddHouseholdMembers;
