import { ApolloError } from '@apollo/client';
import { Alert, AlertTitle } from '@mui/material';

import ApolloErrorTrace from './ApolloErrorTrace';

const ApolloErrorAlert = ({ error }: { error?: ApolloError }) => {
  if (!error) return null;
  return (
    <Alert severity='error'>
      <AlertTitle>An error occurred.</AlertTitle>
      <ApolloErrorTrace error={error} />
    </Alert>
  );
};
export default ApolloErrorAlert;
