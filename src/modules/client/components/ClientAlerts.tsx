import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import Loading from '@/components/elements/Loading';
import TitleCard from '@/components/elements/TitleCard';
import theme from '@/config/theme';
import {
  clientNameAllParts,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import {
  ClientAlertFieldsFragment,
  ClientFieldsFragment,
  HouseholdClientFieldsClientFragment,
} from '@/types/gqlTypes';

interface ClientAlertCardProps {
  alert: ClientAlertFieldsFragment;
  client: ClientFieldsFragment | HouseholdClientFieldsClientFragment;
  shouldShowClientName?: boolean;
}

const ClientAlertCard: React.FC<ClientAlertCardProps> = ({
  alert,
  client,
  shouldShowClientName = false,
}) => {
  const priority = alert.severity || 'low';

  const priorityColors: { [index: string]: any } = {
    high: {
      header: theme.palette.alerts.highPriorityErrorBackground,
      body: `${theme.palette.error.main}04`,
      border: `${theme.palette.error.main}50`,
    },
    medium: {
      header: theme.palette.alerts.mediumPriorityHeaderBackground,
      body: theme.palette.alerts.mediumPriorityBodyBackground,
      border: theme.palette.alerts.mediumPriorityBorder,
    },
    low: {
      header: theme.palette.alerts.lowPriorityHeaderBackground,
      body: theme.palette.alerts.lowPriorityBodyBackground,
      border: theme.palette.alerts.lowPriorityHeaderBackground,
    },
  };

  return (
    <Alert
      sx={{
        p: 0,
        color: 'black',
        backgroundColor: priorityColors[priority].body,
        borderColor: priorityColors[priority].border,
        '& .MuiAlert-message': {
          p: 0,
          width: '100%',
        },
      }}
      icon={false}
      variant='outlined'
    >
      <AlertTitle
        sx={{
          p: 2,
          m: 0,
          backgroundColor: priorityColors[priority].header,
          fontWeight: 'bold',
          textTransform: 'capitalize',
        }}
      >
        {priority} Priority Alert
      </AlertTitle>
      <Box sx={{ p: 2 }}>
        {shouldShowClientName && (
          <Typography variant='body2' sx={{ pb: 1 }}>
            {clientNameAllParts(client)}
          </Typography>
        )}
        <Typography variant='body1' sx={{ pb: 1 }}>
          {alert.note}
        </Typography>
        <Typography variant='body2' sx={{ fontSize: '12px' }}>
          Created by {alert.createdBy?.name} on{' '}
          {parseAndFormatDateTime(alert.createdAt)}.
          {alert.expirationDate &&
            ` Expires on ${parseAndFormatDateTime(alert.expirationDate)}.`}
        </Typography>
      </Box>
    </Alert>
  );
};

export enum AlertContext {
  Client = 'Client',
  Household = 'Household',
}

interface ClientAlertsProps {
  clients: ClientFieldsFragment[] | HouseholdClientFieldsClientFragment[];
  alertContext: AlertContext;
  loading?: boolean;
}

const ClientAlerts: React.FC<ClientAlertsProps> = ({
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
            }}
          >
            {alertContext} has no alerts at this time
          </Box>
        )}
        <Stack gap={2}>
          {clientAlerts.map((ca) => (
            <ClientAlertCard
              key={ca.alert.id}
              alert={ca.alert}
              client={ca.client}
              shouldShowClientName={ca.shouldShowClientName}
            />
          ))}
        </Stack>
      </Box>
    </TitleCard>
  );
};

export default ClientAlerts;
