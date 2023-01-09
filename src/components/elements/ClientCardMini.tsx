import { Stack, Typography } from '@mui/material';

import ClientImage from './ClientImage';

import {
  clientNameWithoutPreferred,
  pronouns,
  age,
} from '@/modules/hmis/hmisUtil';
import { ClientFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientFieldsFragment;
  hideImage?: boolean;
}

const ClientCardMini = ({ client, hideImage = false }: Props) => {
  const primaryName =
    client.preferredName || clientNameWithoutPreferred(client);
  const secondaryName = client.preferredName
    ? clientNameWithoutPreferred(client)
    : null;
  const clientAge = age(client);
  const clientPronouns = pronouns(client);
  return (
    <Stack gap={0.5}>
      <Typography variant='h4'>{primaryName}</Typography>
      {secondaryName && (
        <Typography variant='body1' color='text.secondary' fontStyle='italic'>
          {secondaryName}
        </Typography>
      )}
      <Stack direction='row' gap={1} sx={{ mt: 1 }}>
        {!hideImage && (
          <ClientImage clientId={client.id} width={80} height={80} />
        )}
        <Stack gap={0.5}>
          {clientAge && (
            <Typography variant='body2'>
              <b>Age:</b> {clientAge}
            </Typography>
          )}
          {clientPronouns && (
            <Typography variant='body2'>{clientPronouns}</Typography>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ClientCardMini;
