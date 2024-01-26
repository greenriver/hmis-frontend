import { Box } from '@mui/material';
import { Stack } from '@mui/system';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import ClientAlertCard, {
  ClientAlertCardProps,
} from '@/modules/client/components/clientAlerts/ClientAlertCard';
import { CreateClientAlertButton } from '@/modules/client/components/clientAlerts/CreateClientAlertDialog';
import {
  ClientFieldsFragment,
  HouseholdClientFieldsClientFragment,
} from '@/types/gqlTypes';

export enum AlertContext {
  Client = 'Client',
  Household = 'Household',
}

interface ClientAlertFrameProps {
  clients: ClientFieldsFragment[] | HouseholdClientFieldsClientFragment[];
  alertContext: AlertContext;
  loading?: boolean;
}

const ClientAlertFrame: React.FC<ClientAlertFrameProps> = ({
  clients,
  alertContext = AlertContext.Client,
  loading = true,
}) => {
  const clientAlerts: ClientAlertCardProps[] = [];
  if (!clients) return;
  clients.forEach((c) => {
    if (c.access.canViewClientAlerts) {
      c.alerts.forEach((a) => {
        clientAlerts.push({
          alert: a,
          client: c,
          shouldShowClientName: alertContext === AlertContext.Household,
        });
      });
    }
  });

  const title = `${alertContext} Alerts (${clientAlerts.length})`;
  if (loading && clients.length === 0) return <Loading />;

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
              <ClientAlertCard
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

export default ClientAlertFrame;
