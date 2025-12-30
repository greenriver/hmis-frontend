import { Alert, Box } from '@mui/material';
import useAuth from '@/modules/auth/hooks/useAuth';

const ImpersonationBanner = () => {
  const { user } = useAuth();

  // Debug logging
  console.log('ImpersonationBanner: user=', user);
  console.log('ImpersonationBanner: impersonating=', user?.impersonating);
  console.log('ImpersonationBanner: trueUser=', user?.trueUser);

  if (!user?.impersonating || !user?.trueUser) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <Alert
        severity='warning'
        sx={{
          borderRadius: 0,
          justifyContent: 'center',
          '& .MuiAlert-message': {
            textAlign: 'center',
            width: '100%',
          },
        }}
      >
        Acting as {user.name}
      </Alert>
    </Box>
  );
};

export default ImpersonationBanner;
