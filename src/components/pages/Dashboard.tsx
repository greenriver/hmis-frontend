import { Box, Typography } from '@mui/material';

import clientSearchConfig from '@/api/clientSearchConfig';
import SearchForm from '@/modules/search/components/SearchForm';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ marginLeft: 4, marginTop: 4 }}>
      <Typography variant='h6' sx={{ mb: 2 }}>
        Clients
      </Typography>
      <SearchForm config={clientSearchConfig} />
    </Box>
  );
};

export default Dashboard;
