import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import theme from '@/config/theme';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import {
  clientNameAllParts,
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import {
  ClientAlertFieldsFragment,
  ClientWithAlertFieldsFragment,
  DeleteClientAlertDocument,
  DeleteClientAlertMutation,
  DeleteClientAlertMutationVariables,
} from '@/types/gqlTypes';

export interface ClientAlertProps {
  alert: ClientAlertFieldsFragment;
  client: ClientWithAlertFieldsFragment;
  shouldShowClientName?: boolean;
  showDeleteButton?: boolean;
}

const ClientAlert: React.FC<ClientAlertProps> = ({
  alert,
  client,
  shouldShowClientName = false,
  showDeleteButton = false,
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
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {priority} Priority Alert
        {showDeleteButton && (
          <DeleteMutationButton<
            DeleteClientAlertMutation,
            DeleteClientAlertMutationVariables
          >
            queryDocument={DeleteClientAlertDocument}
            variables={{ id: alert.id }}
            idPath={'deleteClientAlert.clientAlert.id'}
            recordName='Client Alert'
            onSuccess={() => {
              console.log('hello world from martha');
            }}
            deleteIcon={true}
          >
            Delete
          </DeleteMutationButton>
        )}
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
            ` Expires on ${parseAndFormatDate(alert.expirationDate)}.`}
        </Typography>
      </Box>
    </Alert>
  );
};

export default ClientAlert;
