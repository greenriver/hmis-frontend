import { Stack, Typography } from '@mui/material';
import { isNil } from 'lodash-es';

import ClientImage from './ClientImage';

import {
  clientNameAllParts,
  pronouns,
  age,
  getClientImageAltText,
} from '@/modules/hmis/hmisUtil';
import { ClientFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientFieldsFragment;
  hideImage?: boolean;
}

const ClientCardMini = ({ client, hideImage = false }: Props) => {
  const clientAge = age(client);
  const clientPronouns = pronouns(client);
  const clientName = clientNameAllParts(client);

  return (
    <Stack gap={0.5}>
      <Typography component='p' variant='h5'>
        {clientName}
      </Typography>
      <Stack direction='row' gap={1} sx={{ mt: 1 }}>
        {!hideImage && (
          <ClientImage
            clientId={client.id}
            alt={getClientImageAltText(clientName)}
            width={80}
            height={80}
          />
        )}
        <Stack gap={0.5}>
          {!isNil(clientAge) && (
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
