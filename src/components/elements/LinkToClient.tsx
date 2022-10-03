import { LinkProps } from '@mui/material';
import { forwardRef } from 'react';
import { generatePath } from 'react-router-dom';

import RouterLink from './RouterLink';

import { clientName } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

interface Props extends Omit<LinkProps, 'to'> {
  client: ClientFieldsFragment | HouseholdClientFieldsFragment['client'];
  disabled?: boolean;
}
const LinkToClient = forwardRef<Props, any>(
  ({ disabled, client, ...props }, ref) =>
    disabled ? (
      <>{clientName(client)}</>
    ) : (
      <RouterLink
        to={generatePath(Routes.CLIENT_DASHBOARD, {
          clientId: client.id,
        })}
        ref={ref}
        {...props}
      >
        {clientName(client)}
      </RouterLink>
    )
);

export default LinkToClient;
