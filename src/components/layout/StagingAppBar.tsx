import { AppBar, Chip, Toolbar, Box } from '@mui/material';

const StagingAppBar: React.FC = () => (
  <AppBar
    position='static'
    color='secondary'
    sx={{ boxShadow: 0, bgcolor: '#ece3ff', height: 40 }}
  >
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

export default StagingAppBar;
