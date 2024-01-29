import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import theme from '@/config/theme';
import {
  clientNameAllParts,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import {
  ClientAlertFieldsFragment,
  ClientWithAlertFieldsFragment,
} from '@/types/gqlTypes';

export interface ClientAlertProps {
  alert: ClientAlertFieldsFragment;
  client: ClientWithAlertFieldsFragment;
  shouldShowClientName?: boolean;
}

const ClientAlert: React.FC<ClientAlertProps> = ({
  alert,
  client,
  shouldShowClientName = false,
}) => {
  const priority = alert.priority || 'low';

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

export default ClientAlert;
