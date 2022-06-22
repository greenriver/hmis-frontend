import { Box, Container } from '@mui/material';

import LoginForm from '@/modules/auth/components/LoginForm';
const Login = () => (
  <Container component='main' maxWidth='xs'>
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <LoginForm />
    </Box>
  </Container>
);

export default Login;
