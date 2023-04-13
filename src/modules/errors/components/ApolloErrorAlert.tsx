import { ApolloError } from '@apollo/client';
import { Alert, AlertTitle, AlertProps } from '@mui/material';

import ApolloErrorTrace from './ApolloErrorTrace';

const ApolloErrorAlert = ({
  error,
  AlertProps = {},
}: {
  error?: ApolloError;
  AlertProps?: AlertProps;
}) => {
  if (!error) return null;
  return (
    <Alert severity='error' {...AlertProps}>
      <AlertTitle>An error occurred.</AlertTitle>
      <ApolloErrorTrace error={error} />
    </Alert>
  );
};
export default ApolloErrorAlert;
