import { useDashboardClient } from '../pages/ClientDashboard';

import ProfileLayout from './ProfileLayout';

const Profile = () => {
  const { client } = useDashboardClient();

  return <ProfileLayout client={client} />;
};

export default Profile;
