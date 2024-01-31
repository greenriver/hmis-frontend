import { Stack } from '@mui/system';
import { ReactNode } from 'react';
import ClientAlert, {
  ClientAlertProps,
} from '@/modules/client/components/clientAlerts/ClientAlert';

export interface ClientAlertStackProps {
  clientAlerts: ClientAlertProps[];
  children?: ReactNode;
}

const ClientAlertStack: React.FC<ClientAlertStackProps> = ({
  clientAlerts,
  children,
}) => {
  if (clientAlerts.length > 0)
    return (
      <Stack gap={2}>
        {clientAlerts.map((ca) => (
          <ClientAlert
            key={ca.alert.id}
            alert={ca.alert}
            client={ca.client}
            showClientName={ca.showClientName}
          />
        ))}
        {children}
      </Stack>
    );
};

export default ClientAlertStack;
