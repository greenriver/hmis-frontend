import { Stack } from '@mui/system';
import { ReactNode } from 'react';
import ClientAlert, {
  ClientAlertType,
} from '@/modules/client/components/clientAlerts/ClientAlert';

interface ClientAlertStackProps {
  clientAlerts: ClientAlertType[];
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
          <ClientAlert key={ca.alert.id} clientAlert={ca} />
        ))}
        {children}
      </Stack>
    );
};

export default ClientAlertStack;
