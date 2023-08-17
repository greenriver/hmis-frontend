import { Typography } from '@mui/material';
import { GraphQLError } from 'graphql';

const ApolloErrorTrace = ({
  graphqlErrors,
}: {
  graphqlErrors: GraphQLError[];
}) => {
  if (import.meta.env.MODE !== 'development') return null;
  if (graphqlErrors.length === 0) return null;

  return (
    <>
      {graphqlErrors.map((e) => (
        <>
          {((e as GraphQLError & { backtrace: string[] })?.backtrace || []).map(
            (line) => (
              <Typography
                key={line}
                variant='caption'
                sx={{ fontFamily: 'Monospace', display: 'block' }}
              >
                {line}
              </Typography>
            )
          )}
        </>
      ))}
    </>
  );
};

export default ApolloErrorTrace;
