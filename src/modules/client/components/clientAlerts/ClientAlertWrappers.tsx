import Loading from '@/components/elements/Loading';
import ClientAlertCard, {
  AlertContext,
} from '@/modules/client/components/clientAlerts/ClientAlertCard';
import ClientAlertStack from '@/modules/client/components/clientAlerts/ClientAlertStack';
import CreateClientAlertButton from '@/modules/client/components/clientAlerts/CreateClientAlertButton';
import useClientAlerts from '@/modules/client/hooks/useClientAlerts';
import { ClientWithAlertFieldsFragment } from '@/types/gqlTypes';

interface ClientAlertProfileWrapperProps {
  client: ClientWithAlertFieldsFragment;
}
export const ClientAlertProfileWrapper: React.FC<
  ClientAlertProfileWrapperProps
> = ({ client }) => {
  const { clientAlerts } = useClientAlerts({ client }, false);

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
  const { clientAlerts, loading, showClientAlertCard } = useClientAlerts(
    { householdId },
    true
  );

  if (!showClientAlertCard) return;
  if (loading && (!clientAlerts || clientAlerts.length === 0))
    return <Loading />;

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
  const { clientAlerts } = useClientAlerts({ client }, false);
  return <ClientAlertStack clientAlerts={clientAlerts} />;
};
