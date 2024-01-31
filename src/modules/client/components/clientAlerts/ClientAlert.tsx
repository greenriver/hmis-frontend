import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import theme from '@/config/theme';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { ClientAlertFieldsFragment } from '@/types/gqlTypes';

export type ClientAlertType = {
  alert: ClientAlertFieldsFragment;
  clientName: string;
  showClientName?: boolean;
};

export interface ClientAlertProps {
  clientAlert: ClientAlertType;
}
const ClientAlert: React.FC<ClientAlertProps> = ({ clientAlert }) => {
  const alert = clientAlert.alert;
  const clientName = clientAlert.clientName;
  const showClientName = clientAlert.showClientName;
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
        {showClientName && (
          <Typography variant='body2' sx={{ pb: 1 }}>
            {clientName}
          </Typography>
        )}
        <Typography variant='body1' sx={{ pb: 1 }}>
          {alert.note}
        </Typography>
        <Typography variant='body2' sx={{ fontSize: '12px' }}>
          Created by {alert.createdBy?.name || 'Unknown'} on{' '}
          {parseAndFormatDateTime(alert.createdAt)}.
          {alert.expirationDate &&
            ` Expires on ${parseAndFormatDate(alert.expirationDate)}.`}
        </Typography>
      </Box>
    </Alert>
  );
};

export default ClientAlert;
