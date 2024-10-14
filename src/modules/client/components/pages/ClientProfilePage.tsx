import ClientProfileLayout from '../ClientProfileLayout';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';

const ClientProfilePage = () => {
  const { client } = useClientDashboardContext();

  return <ClientProfileLayout client={client} />;
};

export default ClientProfilePage;
