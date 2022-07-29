import ClientCard from '../elements/ClientCard';
import { useDashboardClient } from '../pages/ClientDashboard';

const Profile = () => {
  const { client } = useDashboardClient();

  return <ClientCard client={client} />;
};

export default Profile;
