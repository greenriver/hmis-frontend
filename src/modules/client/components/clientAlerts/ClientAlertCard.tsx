import { Box, Stack, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import TitleCard, { TitleCardProps } from '@/components/elements/TitleCard';
import { ClientAlertType } from '@/modules/client/components/clientAlerts/ClientAlert';
import ClientAlertStack from '@/modules/client/components/clientAlerts/ClientAlertStack';

export enum AlertContext {
  Client = 'Client',
  Household = 'Household',
}

interface ClientAlertCardProps {
  alertContext: AlertContext;
  clientAlerts: ClientAlertType[];
  children?: ReactNode;
  loading?: boolean;
}
const ClientAlertCard: React.FC<ClientAlertCardProps> = ({
  alertContext = AlertContext.Client,
  clientAlerts,
  children,
  loading = false,
}) => {
  const title = useMemo(() => {
    const cardTitle = `${alertContext} Alerts`;
    if (loading) return cardTitle;
    return `${cardTitle} (${clientAlerts.length})`;
  }, [alertContext, clientAlerts.length, loading]);

  const headerVariant: TitleCardProps['headerTypographyVariant'] =
    useMemo(() => {
      if (alertContext === AlertContext.Client) {
        return 'body1';
      } else if (
        alertContext === AlertContext.Household &&
        clientAlerts.length > 0
      ) {
        return 'cardTitleBold';
      }
    }, [alertContext, clientAlerts.length]);

  return (
    <TitleCard
      title={title}
      headerVariant='border'
      headerTypographyVariant={headerVariant}
    >
      <Box sx={{ m: 2 }}>
        {loading && <Loading />}
        {!loading && clientAlerts.length === 0 && (
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            p={1}
            sx={{
              backgroundColor: (theme) => theme.palette.grey[50],
              color: 'text.secondary',
              borderRadius: 1,
            }}
          >
            <Typography variant='body2'>
              {alertContext} has no alerts at this time
            </Typography>
            {children}
          </Stack>
        )}
        {clientAlerts.length > 0 && (
          <ClientAlertStack clientAlerts={clientAlerts}>
            {children}
          </ClientAlertStack>
        )}
      </Box>
    </TitleCard>
  );
};

export default ClientAlertCard;
