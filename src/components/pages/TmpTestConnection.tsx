/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useLazyQuery, ApolloProvider } from '@apollo/client';
import { Button, List, ListItemText, Paper } from '@mui/material';

import { GET_PROJECTS_OLD } from '@/api/projects.gql';
import { client } from '@/providers/app';

const TmpTestConnection = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [sendQuery, { data, loading, error }] = useLazyQuery(GET_PROJECTS_OLD, {
    fetchPolicy: 'network-only',
  });

  return (
    <>
      <Button variant='outlined' onClick={() => sendQuery()}>
        {loading ? 'Loading...' : 'Test Warehouse Connection'}
      </Button>
      {error && <Paper sx={{ mt: 4, p: 2 }}>{error.message}</Paper>}
      {data && (
        <List>
          {data.projects.map(
            ({ id, name, projectType }: Record<string, string>) => (
              <ListItemText
                key={id}
                primary={`${name} (${projectType.toLowerCase()})`}
              />
            )
          )}
        </List>
      )}
    </>
  );
};
const Comp = () => (
  <ApolloProvider client={client}>
    <TmpTestConnection />
  </ApolloProvider>
);
export default Comp;
