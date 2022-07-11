/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useLazyQuery } from '@apollo/client';
import { Box, Button, List, ListItemText, Typography } from '@mui/material';

import clientSearchConfig from '@/api/clientSearchConfig';
import { GET_PROJECTS } from '@/api/projects.gql';
import SearchForm from '@/modules/search/components/SearchForm';

const Dashboard = () => {
  const [getProjects, { data }] = useLazyQuery(GET_PROJECTS);

  return (
    <Box sx={{ marginLeft: 4, marginTop: 4 }}>
      <Typography variant='h6' sx={{ mb: 2 }}>
        Clients
      </Typography>
      <SearchForm config={clientSearchConfig} />
      <br />
      <Button
        variant='outlined'
        sx={{ mt: 3, mb: 2 }}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={() => getProjects({ variables: { projectTypes: ['PSH'] } })}
      >
        Fetch Project List
      </Button>
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
    </Box>
  );
};

export default Dashboard;
