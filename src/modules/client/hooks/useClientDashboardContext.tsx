import { useOutletContext } from 'react-router-dom';
import { ClientDashboardContext } from '@/modules/client/components/pages/ClientDashboard';

export default function useClientDashboardContext() {
  return useOutletContext<ClientDashboardContext>();
}
