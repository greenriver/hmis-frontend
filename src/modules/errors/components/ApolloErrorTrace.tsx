import { Box } from '@mui/material';
import { GraphQLError } from 'graphql';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';

const ApolloErrorTrace = ({
  graphqlErrors,
}: {
  graphqlErrors: GraphQLError[];
}) => {
  if (import.meta.env.MODE !== 'development') return null;
  if (graphqlErrors.length === 0) return null;

  return (
    <Box
      sx={{
        fontFamily: 'Monospace',
        display: 'block',
        p: 2,
        background: '#fff',
        color: '#555',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {graphqlErrors.map((e) => (
        <CommonUnstyledList key={e.toString()}>
          {((e as GraphQLError & { backtrace: string[] })?.backtrace || []).map(
            (line) => (
              <li>{line}</li>
            )
          )}
        </CommonUnstyledList>
      ))}
    </Box>
  );
};

export default ApolloErrorTrace;
