import { Stack, Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import ClickToShow from '@/components/elements/ClickToShow';
import { dob } from '@/modules/hmis/hmisUtil';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

interface Props {
  client: ClientIdentificationFieldsFragment;
  noValue?: ReactNode;
  variant?: TypographyProps['variant'];
  reveal?: boolean;
  onlyAge?: boolean;
}

const ClientDobAge = ({
  client,
  noValue,
  reveal,
  variant = 'body2',
  onlyAge,
}: Props) => {
  if (!client.dob && !client.age) return <>{noValue}</> || null;

  const dobComponent = <Typography variant={variant}>{dob(client)}</Typography>;
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

export const ClientSafeDobAge: React.FC<Props> = (props) => {
  const { client } = props;

  const [canViewDob] = useHasClientPermissions(client.id, ['canViewDob']);

  return <ClientDobAge client={client} onlyAge={!canViewDob} />;
};

export default ClientDobAge;
