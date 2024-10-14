import ClientProfileLayout from '../ClientProfileLayout';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';

const ClientProfilePage = () => {
  const { client } = useClientDashboardContext();

  return <ClientProfileLayout client={client} />;
};

export default ClientProfilePage;
