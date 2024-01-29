import Loading from '@/components/elements/Loading';
import ClientAlertCard, {
  AlertContext,
} from '@/modules/client/components/clientAlerts/ClientAlertCard';
import { useGetHouseholdClientAlertsQuery } from '@/types/gqlTypes';

interface ClientAlertCardHouseholdWrapperProps {
  householdId: string;
}

const ClientAlertCardHouseholdWrapper: React.FC<
  ClientAlertCardHouseholdWrapperProps
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

  return (
    <ClientAlertCard
      alertContext={AlertContext.Household}
      clients={clients || []}
    />
  );
};

export default ClientAlertCardHouseholdWrapper;
