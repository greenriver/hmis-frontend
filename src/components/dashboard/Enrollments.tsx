import { Paper } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

import { Client } from '@/types/gqlTypes';

const Profile = () => {
  const { client } = useOutletContext<{ client: Client | null }>();
  if (!client) throw Error('Missing client');

  return <Paper>Enrollments table for {client.firstName}</Paper>;
};

export default Profile;
