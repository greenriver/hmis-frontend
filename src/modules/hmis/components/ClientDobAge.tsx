import { Stack, Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import ClickToShow from '@/components/elements/ClickToShow';
import { age, dob } from '@/modules/hmis/hmisUtil';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientIdentificationFieldsFragment;
  noValue?: ReactNode;
  variant?: TypographyProps['variant'];
}

const ClientDobAge = ({ client, noValue, variant = 'body2' }: Props) => {
  if (!client.dob) return <>{noValue}</> || null;

  return (
    <Stack direction='row' gap={0.5}>
      <ClickToShow text='Reveal DOB' variant={variant}>
        <Typography variant={variant}>{dob(client)}</Typography>
      </ClickToShow>
      <Typography variant={variant}>({age(client)})</Typography>
    </Stack>
  );
};

export default ClientDobAge;
