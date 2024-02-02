import { useMemo } from 'react';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import {
  ClientWithAlertFieldsFragment,
  useGetHouseholdClientAlertsQuery,
} from '@/types/gqlTypes';

enum AlertPriority {
  high = 3,
  medium = 2,
  low = 1,
}

interface ClientAlertParams {
  householdId?: string;
  client?: ClientWithAlertFieldsFragment;
}

export default function useClientAlerts(
  params: ClientAlertParams,
  showClientName?: boolean
) {
  const [canViewClientAlerts] = useHasRootPermissions(['canViewClientAlerts']);

  const {
    data: { household } = {},
    loading,
    error,
  } = useGetHouseholdClientAlertsQuery({
    variables: { id: params.householdId || '' },
    skip: !params.householdId || !canViewClientAlerts,
  });

  const canViewAlertsForAnyHouseholdMembers = useMemo(() => {
    if (!canViewClientAlerts) return false;
    if (!household) return true;
    const clients = household.householdClients.map((c) => c.client);
    return clients.some((c) => c.access.canViewClientAlerts);
  }, [household, canViewClientAlerts]);

  const clientAlerts = useMemo(() => {
    const clients = household
      ? household.householdClients.map((c) => c.client)
      : params.client
      ? [params.client]
      : [];

    const clientAlerts = clients.flatMap((client) =>
      client.alerts.map((alert) => ({
        alert,
        clientName: clientBriefName(client),
        showClientName,
      }))
    );

    clientAlerts.sort((a, b) => {
      if (AlertPriority[a.alert.priority] === AlertPriority[b.alert.priority]) {
        // If priority is the same, sort by date descending (most recent at the top)
        return Date.parse(b.alert.createdAt) - Date.parse(a.alert.createdAt);
      } else {
        return (
          AlertPriority[b.alert.priority] - AlertPriority[a.alert.priority]
        );
      }
    });

    return clientAlerts;
  }, [params.client, household, showClientName]); // only re-run when these change

  if (error) throw error;

  return {
    clientAlerts,
    loading,
    showClientAlertCard: canViewAlertsForAnyHouseholdMembers,
  };
}
