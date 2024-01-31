import { ClientAlertProps } from '@/modules/client/components/clientAlerts/ClientAlert';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { ClientWithAlertFieldsFragment } from '@/types/gqlTypes';

enum AlertPriority {
  high = 3,
  medium = 2,
  low = 1,
}

export function getClientAlerts(
  clients: ClientWithAlertFieldsFragment[],
  shouldShowClientName: boolean = false
) {
  const clientAlerts: ClientAlertProps[] = [];
  clients.forEach((c) => {
    c.alerts.forEach((a) => {
      clientAlerts.push({
        alert: a,
        clientName: clientBriefName(c),
        showClientName: shouldShowClientName,
      });
    });
  });

  clientAlerts.sort((a, b) => {
    if (AlertPriority[a.alert.priority] === AlertPriority[b.alert.priority]) {
      return Date.parse(a.alert.createdAt) - Date.parse(b.alert.createdAt);
    } else {
      return AlertPriority[b.alert.priority] - AlertPriority[a.alert.priority];
    }
  });

  return clientAlerts;
}
