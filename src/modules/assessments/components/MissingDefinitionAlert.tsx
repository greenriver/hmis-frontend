import { Alert, Stack, Typography } from '@mui/material';

const MissingDefinitionAlert = ({
  hasAssessmentDetail,
}: {
  hasAssessmentDetail: boolean;
}) => (
  <Alert severity='error'>
    <Stack direction={'row'} spacing={0.5}>
      {!hasAssessmentDetail && (
        <span>
          Unable to load this assessment because it was generated in another
          system.
        </span>
      )}
      {hasAssessmentDetail && <span>Unable to load form. </span>}
      {import.meta.env.MODE === 'development' && hasAssessmentDetail && (
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
