import { useDashboardClient } from '../pages/ClientDashboard';

import ClientCard from '@/components/elements/ClientCard';

const Profile = () => {
  const { client } = useDashboardClient();

  return <ClientCard client={client} />;
};

export default Profile;
