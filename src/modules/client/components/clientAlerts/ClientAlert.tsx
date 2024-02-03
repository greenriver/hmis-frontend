import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  ClientAlertFieldsFragment,
  DeleteClientAlertDocument,
  DeleteClientAlertMutation,
  DeleteClientAlertMutationVariables,
} from '@/types/gqlTypes';

export type ClientAlertType = {
  alert: ClientAlertFieldsFragment;
  clientName: string;
  clientId: string;
  showClientName?: boolean;
  showDeleteButton?: boolean;
};

interface ClientAlertProps {
  clientAlert: ClientAlertType;
}
const ClientAlert: React.FC<ClientAlertProps> = ({ clientAlert }) => {
  const { alert, clientName, showClientName } = clientAlert;

  return (
    <Alert icon={false} variant='withHeader' color={alert.priority}>
      <AlertTitle
        sx={{
          textTransform: 'capitalize',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {alert.priority} Priority Alert
        {clientAlert.showDeleteButton && (
          <DeleteMutationButton<
            DeleteClientAlertMutation,
            DeleteClientAlertMutationVariables
          >
            queryDocument={DeleteClientAlertDocument}
            variables={{ id: alert.id }}
            idPath={'deleteClientAlert.clientAlert.id'}
            recordName='Alert'
            onSuccess={() => {
              cache.evict({
                id: `Client:${clientAlert.clientId}`,
                fieldName: 'alerts',
              });
            }}
            onlyIcon
            className='MuiAlert-deleteIcon'
          >
            Delete
          </DeleteMutationButton>
        )}
      </AlertTitle>
      <Box className='MuiAlert-body'>
        {showClientName && (
          <Typography variant='body2' sx={{ pb: 1 }}>
            {clientName}
          </Typography>
        )}
        <Typography variant='body1' sx={{ pb: 1 }}>
          {alert.note}
        </Typography>
        <Typography variant='caption'>
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
