import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const EnrollmentPage: React.FC = () => {
  const { clientId, enrollmentId } = useParams();
  return (
    <Box>
      Enrollment {enrollmentId} for client {clientId}
    </Box>
  );
};

export default EnrollmentPage;
