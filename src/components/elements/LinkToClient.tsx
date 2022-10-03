import { Link, LinkProps } from '@mui/material';
import { generatePath, Link as RouterLink } from 'react-router-dom';

import { clientName } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

interface Props extends LinkProps {
  client: ClientFieldsFragment | HouseholdClientFieldsFragment['client'];
  disabled?: boolean;
}
const LinkToClient = ({ client, disabled, ...props }: Props) =>
  disabled ? (
    <>{clientName(client)}</>
  ) : (
    <Link
      component={RouterLink}
      to={generatePath(Routes.CLIENT_DASHBOARD, {
        clientId: client.id,
      })}
      {...props}
    >
      {clientName(client)}
    </Link>
  );

export default LinkToClient;
