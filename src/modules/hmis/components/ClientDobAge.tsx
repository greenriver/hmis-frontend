import { Stack, Typography, TypographyProps } from '@mui/material';
import { isNil } from 'lodash-es';
import { ReactNode } from 'react';

import ClickToShow from '@/components/elements/ClickToShow';
import { dob } from '@/modules/hmis/hmisUtil';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientIdentificationFieldsFragment;
  noValue?: ReactNode;
  variant?: TypographyProps['variant'];
  reveal?: boolean;
}

const ClientDobAge = ({
  client,
  noValue,
  reveal,
  variant = 'body2',
}: Props) => {
  if (isNil(client.dob) && isNil(client.age)) return <>{noValue}</> || null;

  const dobComponent = <Typography variant={variant}>{dob(client)}</Typography>;
  const onlyAge = isNil(client.dob) && !isNil(client.age);

  return (
    <Stack direction='row' gap={0.5}>
      {client.dob &&
        !onlyAge &&
        (reveal ? (
          dobComponent
        ) : (
          <ClickToShow text='Reveal DOB' variant={variant}>
            {dobComponent}
          </ClickToShow>
        ))}
      <Typography variant={variant}>
        {onlyAge ? client.age : <>({client.age})</>}
      </Typography>
    </Stack>
  );
};

export default ClientDobAge;
