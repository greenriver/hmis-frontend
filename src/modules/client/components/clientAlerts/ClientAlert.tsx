import { Alert, AlertTitle, Box, Typography } from '@mui/material';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import {
  ClientAlertFieldsFragment,
  DeleteClientAlertDocument,
  DeleteClientAlertMutation,
  DeleteClientAlertMutationVariables,
} from '@/types/gqlTypes';

export type ClientAlertType = {
  alert: ClientAlertFieldsFragment;
  clientName: string;
  showClientName?: boolean;
  showDeleteButton?: boolean;
};

interface ClientAlertProps {
  clientAlert: ClientAlertType;
}
const ClientAlert: React.FC<ClientAlertProps> = ({ clientAlert }) => {
  const alert = clientAlert.alert;
  const priority = alert.priority || 'low';

  return (
    <Alert icon={false} variant='withHeader' color={priority}>
      <AlertTitle
        sx={{
          textTransform: 'capitalize',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {priority} Priority Alert
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
              console.log('hello world from martha');
            }}
            onlyIcon
          >
            Delete
          </DeleteMutationButton>
        )}
      </AlertTitle>
      <Box className='MuiAlert-body'>
        {clientAlert.showClientName && (
          <Typography variant='body2' sx={{ pb: 1 }}>
            {clientAlert.clientName}
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
