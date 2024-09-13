import { useClientDashboardContext } from '../pages/ClientDashboard';

import ProfileLayout from './ProfileLayout';

const Profile = () => {
  const { client } = useClientDashboardContext();

  return <ProfileLayout client={client} />;
};

export default Profile;
