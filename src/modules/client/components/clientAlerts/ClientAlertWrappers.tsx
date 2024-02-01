import Loading from '@/components/elements/Loading';
import ClientAlertCard, {
  AlertContext,
} from '@/modules/client/components/clientAlerts/ClientAlertCard';
import ClientAlertStack from '@/modules/client/components/clientAlerts/ClientAlertStack';
import CreateClientAlertButton from '@/modules/client/components/clientAlerts/CreateClientAlertButton';
import { getClientAlerts } from '@/modules/client/components/clientAlerts/getClientAlerts';
import {
  ClientWithAlertFieldsFragment,
  useGetHouseholdClientAlertsQuery,
} from '@/types/gqlTypes';

interface ClientAlertProfileWrapperProps {
  client: ClientWithAlertFieldsFragment;
}
export const ClientAlertProfileWrapper: React.FC<
  ClientAlertProfileWrapperProps
> = ({ client }) => {
  if (!client.access.canViewClientAlerts) return;

  const clientAlerts = getClientAlerts([client], false, true);

  return (
    <ClientAlertCard
      alertContext={AlertContext.Client}
      clientAlerts={clientAlerts}
    >
      {client.access.canManageClientAlerts && (
        <CreateClientAlertButton client={client} />
      )}
    </ClientAlertCard>
  );
};

interface ClientAlertHouseholdWrapperProps {
  householdId: string;
}
export const ClientAlertHouseholdWrapper: React.FC<
  ClientAlertHouseholdWrapperProps
> = ({ householdId }) => {
  const {
    data: { household } = {},
    loading,
    error,
  } = useGetHouseholdClientAlertsQuery({ variables: { id: householdId } });

  if (loading && !household) return <Loading />;
  if (error) throw error;
  if (!household) throw new Error('Household not found');

  const clients = household.householdClients.map((c) => c.client);
  const canViewClientAlerts = clients.some((c) => c.access.canViewClientAlerts);
  if (!canViewClientAlerts) return;

  const clientAlerts = getClientAlerts(clients, clients.length > 1, true);

  return (
    <ClientAlertCard
      alertContext={AlertContext.Household}
      clientAlerts={clientAlerts}
    />
  );
};

interface ClientAlertEnrollmentWrapperProps {
  client: ClientWithAlertFieldsFragment;
}
export const ClientAlertEnrollmentWrapper: React.FC<
  ClientAlertEnrollmentWrapperProps
> = ({ client }) => {
  const clientAlerts = getClientAlerts([client], false);
  return <ClientAlertStack clientAlerts={clientAlerts} />;
};
