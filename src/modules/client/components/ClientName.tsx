import { Stack, StackProps, Typography, TypographyProps } from '@mui/material';
import { forwardRef } from 'react';

import RouterLink, { RouterLinkProps } from '@/components/elements/RouterLink';
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
  bold?: boolean;
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
      bold = false,
      ...props
    },
    ref
  ) => {
    const primaryName =
      client.preferredName || clientNameWithoutPreferred(client);
    const secondaryName = client.preferredName
      ? clientNameWithoutPreferred(client)
      : null;

    const primaryNameText = (
      <Typography
        variant={variant}
        fontWeight={bold ? 800 : undefined}
        {...props}
      >
        {primaryName}
      </Typography>
    );

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
          {primaryNameText}
        </RouterLink>
      ) : (
        primaryNameText
      );

    return (
      <Stack direction='row' gap={1} {...stackProps}>
        {primaryNameComponent}
        {secondaryName && (
          <Typography
            variant={variant}
            color='text.secondary'
            fontStyle='italic'
            {...secondaryNameProps}
          >
            {secondaryName}
          </Typography>
        )}
      </Stack>
    );
  }
);

ClientName.displayName = 'ClientName';

export default ClientName;
