import { AppBar, Chip, Toolbar, Box } from '@mui/material';

const StagingAppBar: React.FC = () => (
  <AppBar
    position='static'
    color='secondary'
    sx={{ boxShadow: 0, bgcolor: '#ece9f2', border: 'none', height: 40 }}
  >
    <Toolbar variant='dense' sx={{ minHeight: 40 }}>
      <Box display='flex' flexGrow={1} sx={{ justifyContent: 'flex-end' }}>
        {import.meta.env.MODE === 'development' && (
          <Chip
            label={import.meta.env.PUBLIC_GIT_BRANCH_NAME as string}
            size='small'
            color='info'
            sx={{ mr: 1 }}
          />
        )}
        {import.meta.env.MODE === 'staging' &&
          import.meta.env.PUBLIC_GIT_COMMIT_HASH && (
            <Chip
              label={import.meta.env.PUBLIC_GIT_COMMIT_HASH as string}
              size='small'
              color='info'
              sx={{ mr: 1 }}
            />
          )}
      </Box>
    </Toolbar>
  </AppBar>
);

export default StagingAppBar;
