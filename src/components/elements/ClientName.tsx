import { Stack, StackProps, Typography, TypographyProps } from '@mui/material';
import { forwardRef } from 'react';

import RouterLink, { RouterLinkProps } from './RouterLink';

import { clientNameWithoutPreferred } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { ClientNameFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props extends TypographyProps {
  client: ClientNameFragment;
  secondaryNameProps?: TypographyProps;
  stackProps?: StackProps;
  routerLinkProps?: RouterLinkProps;
  linkToProfile?: boolean;
}

const ClientName = forwardRef<Props, any>(
  (
    {
      client,
      secondaryNameProps,
      stackProps,
      routerLinkProps,
      variant = 'body2',
      linkToProfile = false,
      ...props
    },
    ref
  ) => {
    const primaryName =
      client.preferredName || clientNameWithoutPreferred(client);
    const secondaryName = client.preferredName
      ? clientNameWithoutPreferred(client)
      : null;

    const primaryNameComponent =
      routerLinkProps?.to || linkToProfile ? (
        <RouterLink
          to={
            linkToProfile
              ? generateSafePath(Routes.CLIENT_DASHBOARD, {
                  clientId: client.id,
                })
              : undefined
          }
          {...routerLinkProps}
          ref={ref}
        >
          <Typography variant={variant} {...props}>
            {primaryName}
          </Typography>
        </RouterLink>
      ) : (
        <Typography variant={variant} {...props}>
          {primaryName}
        </Typography>
      );

    if (!secondaryName) {
      return primaryNameComponent;
    }

    return (
      <Stack direction='row' gap={1} {...stackProps}>
        {primaryNameComponent}
        <Typography
          variant={variant}
          color='text.secondary'
          fontStyle='italic'
          {...secondaryNameProps}
        >
          {secondaryName}
        </Typography>
      </Stack>
    );
  }
);

export default ClientName;
