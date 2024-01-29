import { Box } from '@mui/material';
import { Stack } from '@mui/system';
import TitleCard from '@/components/elements/TitleCard';
import ClientAlert, {
  ClientAlertProps,
} from '@/modules/client/components/clientAlerts/ClientAlert';
import { CreateClientAlertButton } from '@/modules/client/components/clientAlerts/CreateClientAlertDialog';
import { ClientWithAlertFieldsFragment } from '@/types/gqlTypes';

export enum AlertContext {
  Client = 'Client',
  Household = 'Household',
}

export enum AlertPriority {
  high = 3,
  medium = 2,
  low = 1,
}

interface ClientAlertCardProps {
  clients: ClientWithAlertFieldsFragment[];
  alertContext: AlertContext;
  shouldRenderFrame?: boolean;
}

const ClientAlertCard: React.FC<ClientAlertCardProps> = ({
  clients,
  alertContext = AlertContext.Client,
  shouldRenderFrame = true,
}) => {
  const shouldShowClientName =
    alertContext === AlertContext.Household && clients.length > 1;

  const clientAlerts: ClientAlertProps[] = [];
  clients.forEach((c) => {
    if (c.access.canViewClientAlerts) {
      c.alerts.forEach((a) => {
        clientAlerts.push({
          alert: a,
          client: c,
          shouldShowClientName: shouldShowClientName,
        });
      });
    }
  });

  clientAlerts.sort((a, b) => {
    if (AlertPriority[a.alert.priority] === AlertPriority[b.alert.priority]) {
      return Date.parse(a.alert.createdAt) - Date.parse(b.alert.createdAt);
    } else {
      return AlertPriority[b.alert.priority] - AlertPriority[a.alert.priority];
    }
  });

  const title = `${alertContext} Alerts (${clientAlerts.length})`;

  if (!shouldRenderFrame) {
    return (
      <Stack gap={2}>
        {clientAlerts.map((ca) => (
          <ClientAlert
            key={ca.alert.id}
            alert={ca.alert}
            client={ca.client}
            shouldShowClientName={ca.shouldShowClientName}
          />
        ))}
      </Stack>
    );
  }

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
            <CreateClientAlertButton />
          </Box>
        )}
        {clientAlerts.length > 0 && (
          <Stack gap={2}>
            {clientAlerts.map((ca) => (
              <ClientAlert
                key={ca.alert.id}
                alert={ca.alert}
                client={ca.client}
                shouldShowClientName={ca.shouldShowClientName}
              />
            ))}
            <CreateClientAlertButton />
          </Stack>
        )}
      </Box>
    </TitleCard>
  );
};

export default ClientAlertCard;
