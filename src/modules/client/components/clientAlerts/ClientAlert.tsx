import { Alert, AlertTitle, Box, Typography } from '@mui/material';
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

interface ClientAlertProps {
  clientAlert: ClientAlertType;
}
const ClientAlert: React.FC<ClientAlertProps> = ({ clientAlert }) => {
  const { alert, clientName, showClientName, priority } = clientAlert;

  return (
    <Alert icon={false} variant='withHeader' color={priority}>
      <AlertTitle
        sx={{
          textTransform: 'capitalize',
        }}
      >
        {priority} Priority Alert
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
