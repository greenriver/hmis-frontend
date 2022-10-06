import { Grid, Typography } from '@mui/material';

// import DetailGrid from '@/components/elements/DetailGrid';
import { OrganizationDetailFieldsFragment } from '@/types/gqlTypes';

const OrganizationDetails = ({
  organization,
}: {
  organization: OrganizationDetailFieldsFragment;
}) => (
  <Grid container spacing={3}>
    {organization.description && (
      <Grid item xs={12}>
        <Typography variant='body1' sx={{ whiteSpace: 'pre-line' }}>
          {organization.description}
        </Typography>
      </Grid>
    )}
    {/* <DetailGrid
      data={[
        {
          label: 'Victim Service Provider',
          value: organization?.victimServiceProvider ? 'Yes' : 'No',
        },
      ]}
    /> */}
  </Grid>
);

export default OrganizationDetails;
