import { Box } from '@mui/material';
import { ReactNode } from 'react';
import TitleCard from '@/components/elements/TitleCard';
import { ClientAlertProps } from '@/modules/client/components/clientAlerts/ClientAlert';
import ClientAlertStack from '@/modules/client/components/clientAlerts/ClientAlertStack';

export enum AlertContext {
  Client = 'Client',
  Household = 'Household',
}

interface ClientAlertCardProps {
  alertContext: AlertContext;
  clientAlerts: ClientAlertProps[];
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
          <Box
            sx={{
              p: 2,
              backgroundColor: '#fafafa',
              color: '#00000060',
              borderRadius: 1,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {alertContext} has no alerts at this time
            {children}
          </Box>
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
