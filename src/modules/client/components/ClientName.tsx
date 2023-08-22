import { Stack, StackProps, Typography, TypographyProps } from '@mui/material';
import { forwardRef, useMemo } from 'react';

import RouterLink, { RouterLinkProps } from '@/components/elements/RouterLink';
import { clientBriefName, clientNameAllParts } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes, Routes } from '@/routes/routes';
import { ClientNameFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props extends TypographyProps {
  client: ClientNameFragment;
  secondaryNameProps?: TypographyProps;
  stackProps?: StackProps;
  routerLinkProps?: RouterLinkProps;
  linkToProfile?: boolean;
  linkToEnrollmentId?: string;
  nameParts?: 'first_only' | 'last_only' | 'brief_name' | 'full_name';
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
      nameParts = 'full_name',
      linkToProfile = false,
      linkToEnrollmentId,
      bold = false,
      ...props
    },
    ref
  ) => {
    const primaryName = useMemo(() => {
      if (nameParts === 'full_name') return clientNameAllParts(client);
      if (nameParts === 'brief_name') return clientBriefName(client);
      if (nameParts === 'first_only') return client.firstName;
      if (nameParts === 'last_only') return client.lastName;
    }, [nameParts, client]);

    const primaryNameText = (
      <Typography
        variant={variant}
        fontWeight={bold ? 800 : undefined}
        {...props}
      >
        {primaryName}
      </Typography>
    );

    const linkTo = useMemo(() => {
      if (linkToProfile) {
        return generateSafePath(Routes.CLIENT_DASHBOARD, {
          clientId: client.id,
        });
      }
      if (linkToEnrollmentId) {
        return generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
          clientId: client.id,
          enrollmentId: linkToEnrollmentId,
        });
      }
      return routerLinkProps?.to;
    }, [client.id, linkToEnrollmentId, linkToProfile, routerLinkProps?.to]);

    return (
      <Stack direction='row' gap={1} data-testid='clientName' {...stackProps}>
        {linkTo ? (
          <RouterLink {...routerLinkProps} to={linkTo} ref={ref}>
            {primaryNameText}
          </RouterLink>
        ) : (
          primaryNameText
        )}
      </Stack>
    );
  }
);

ClientName.displayName = 'ClientName';

export default ClientName;
