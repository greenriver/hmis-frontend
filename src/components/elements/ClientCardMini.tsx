import { Stack, Typography } from '@mui/material';

import {
  clientName,
  pronouns,
  age,
  clientFullNameWithoutPreferred,
} from '@/modules/hmis/hmisUtil';
import { ClientFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientFieldsFragment;
}

const ClientCardMini = ({ client }: Props) => {
  const primaryName = client.preferredName || clientName(client);
  const secondaryName = client.preferredName
    ? clientFullNameWithoutPreferred(client)
    : null;
  const clientAge = age(client);
  const clientPronouns = pronouns(client);
  return (
    <Stack gap={0.5}>
      <Typography variant='h4'>{primaryName}</Typography>
      {secondaryName && (
        <Typography variant='body1' color='text.secondary' fontStyle={'italic'}>
          {secondaryName}
        </Typography>
      )}
      {clientAge && (
        <Typography variant='body2'>
          <b>Age:</b> {clientAge}
        </Typography>
      )}
      {clientPronouns && (
        <Typography variant='body2'>{clientPronouns}</Typography>
      )}
    </Stack>
  );
};

export default ClientCardMini;
