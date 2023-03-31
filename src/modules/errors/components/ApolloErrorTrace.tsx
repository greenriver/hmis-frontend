import { ApolloError } from '@apollo/client';
import { Typography } from '@mui/material';
import { GraphQLError } from 'graphql';

import { isServerError } from '../util';

const ApolloErrorTrace = ({ error }: { error: ApolloError }) => {
  let graphQLErrors = error.graphQLErrors;
  if (graphQLErrors.length < 1 && isServerError(error.networkError)) {
    graphQLErrors = error.networkError?.result?.errors || [];
  }

  return (
    <>
      {graphQLErrors.map((e) => (
        <>
          <Typography
            key={e.message}
            variant='body2'
            sx={{ fontFamily: 'Monospace', my: 2 }}
          >
            {e.message}
          </Typography>
          {import.meta.env.MODE === 'development' &&
            (
              (e as GraphQLError & { backtrace: string[] })?.backtrace || []
            ).map((line) => (
              <Typography
                key={line}
                variant='caption'
                sx={{ fontFamily: 'Monospace', display: 'block' }}
              >
                {line}
              </Typography>
            ))}
        </>
      ))}
    </>
  );
};

export default ApolloErrorTrace;
