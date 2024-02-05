import { Box, Stack } from '@mui/material';
import { ReactNode } from 'react';
import TitleCard from '@/components/elements/TitleCard';
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
}
const ClientAlertCard: React.FC<ClientAlertCardProps> = ({
  alertContext = AlertContext.Client,
  clientAlerts,
  children,
}) => {
  const title = `${alertContext} Alerts (${clientAlerts.length})`;

  return (
    <TitleCard
      title={title}
      headerVariant='border'
      headerTypographyVariant='body1'
    >
      <Box sx={{ m: 2 }}>
        {clientAlerts.length === 0 && (
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
            {alertContext} has no alerts at this time
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
