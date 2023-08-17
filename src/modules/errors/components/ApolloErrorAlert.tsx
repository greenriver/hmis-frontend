import { ApolloError } from '@apollo/client';
import { Alert, AlertTitle, AlertProps, Box, Button } from '@mui/material';

import { isServerError, UNKNOWN_ERROR_HEADING } from '../util';

import ApolloErrorTrace from './ApolloErrorTrace';

const ApolloErrorAlert = ({
  error,
  AlertProps = {},
  retry,
}: {
  error?: ApolloError;
  AlertProps?: AlertProps;
  retry?: VoidFunction;
}) => {
  if (!error) return null;

  let graphqlErrors = [...error.graphQLErrors];
  if (error.graphQLErrors.length < 1 && isServerError(error.networkError)) {
    graphqlErrors = error.networkError?.result?.errors || [];
  }

  return (
    <Alert severity='error' {...AlertProps}>
      <AlertTitle sx={{ mb: 0 }}>
        {graphqlErrors[0]?.message || UNKNOWN_ERROR_HEADING}
      </AlertTitle>
      <ApolloErrorTrace graphqlErrors={graphqlErrors} />
      {import.meta.env.MODE === 'development' && retry && (
        <Box>
          <Button size='small' sx={{ my: 2 }} onClick={retry}>
            Retry
          </Button>
        </Box>
      )}
    </Alert>
  );
};
export default ApolloErrorAlert;
