import { Grid, Typography } from '@mui/material';

import { OrganizationDetailFieldsFragment } from '@/types/gqlTypes';

const OrganizationDetails = ({
  organization,
}: {
  organization: OrganizationDetailFieldsFragment;
}) => {
  if (!organization.description) return null;
  return (
    <Grid container spacing={3}>
      {organization.description && (
        <Grid item xs={12}>
          <Typography variant='subtitle2'>
            {organization.description}
          </Typography>
        </Grid>
      )}
      {/* <DetailGrid data={data} /> */}
    </Grid>
  );
};

export default OrganizationDetails;
