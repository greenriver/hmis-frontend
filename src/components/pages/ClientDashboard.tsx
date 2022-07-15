import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
const ClientDashboard: React.FC = () => {
  const { clientId } = useParams();
  return <Box>Client {clientId}</Box>;
};

export default ClientDashboard;
