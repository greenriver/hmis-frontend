import { Alert, Stack, Typography } from '@mui/material';

const MissingDefinitionAlert = () => (
  <Alert severity='error'>
    <Stack direction={'row'} spacing={0.5}>
      <span>Unable to load form. </span>
      {import.meta.env.MODE === 'development' && (
        <>
          <span>Did you run</span>
          <Typography variant='body2' sx={{ fontFamily: 'Monospace' }}>
            rails driver:hmis:seed_definitions
          </Typography>
          <span>?</span>
        </>
      )}
    </Stack>
  </Alert>
);

export default MissingDefinitionAlert;
