import { Stack, Typography, TypographyProps } from '@mui/material';
import { isNil } from 'lodash-es';
import { ReactNode } from 'react';

import ClickToShow, {
  Props as ClickToShowProps,
} from '@/components/elements/ClickToShow';
import { dob } from '@/modules/hmis/hmisUtil';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

interface Props extends Pick<ClickToShowProps, 'hide' | 'onToggle'> {
  client: ClientIdentificationFieldsFragment;
  noValue?: ReactNode;
  variant?: TypographyProps['variant'];
  alwaysShow?: boolean;
  noDob?: boolean;
}

const ClientDobAge = ({
  client,
  noValue,
  alwaysShow,
  variant = 'body2',
  noDob = false,
  hide,
  onToggle,
}: Props) => {
  if (isNil(client.dob) && isNil(client.age)) return <>{noValue}</> || null;

  const dobComponent = <Typography variant={variant}>{dob(client)}</Typography>;
  const onlyAge = isNil(client.dob) && !isNil(client.age);

  return (
    <Stack direction='row' gap={0.5}>
      {!noDob &&
        client.dob &&
        !onlyAge &&
        (alwaysShow ? (
          dobComponent
        ) : (
          <ClickToShow
            variant={variant}
            hide={hide}
            onToggle={onToggle}
            hiddenAriaLabel={`${client.id} DOB Hidden`}
          >
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
