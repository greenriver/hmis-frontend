import { AppBar, Chip, Toolbar, Box } from '@mui/material';
import * as React from 'react';

export const StagingAppBar = () => {
  return (
    <AppBar position='static' color='secondary' sx={{ height: 40 }}>
      <Toolbar variant='dense' sx={{ minHeight: 40 }}>
        <Box display='flex' flexGrow={1} sx={{ justifyContent: 'flex-end' }}>
          <Chip
            label={import.meta.env.VITE_GIT_BRANCH_NAME as string}
            size='small'
            color='info'
            sx={{ mr: 1 }}
          />
          {import.meta.env.MODE === 'staging' && (
            <Chip
              label={import.meta.env.VITE_GIT_COMMIT_HASH as string}
              size='small'
              color='info'
              sx={{ mr: 1 }}
            />
          )}
          {import.meta.env.MODE === 'staging' && (
            <Chip
              label={import.meta.env.VITE_GIT_COMMIT_DATE as string}
              size='small'
              color='info'
            />
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
