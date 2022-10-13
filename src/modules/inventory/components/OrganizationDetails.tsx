import { Grid } from '@mui/material';

import DetailGrid from '@/components/elements/DetailGrid';
import MultilineTypography from '@/components/elements/MultilineTypography';
import { OrganizationDetailFieldsFragment } from '@/types/gqlTypes';

const OrganizationDetails = ({
  organization,
}: {
  organization: OrganizationDetailFieldsFragment;
}) => (
  <Grid container spacing={3}>
    {organization.description && (
      <Grid item xs={12}>
        <MultilineTypography variant='body1'>
          {organization.description}
        </MultilineTypography>
      </Grid>
    )}
    {organization?.victimServiceProvider && (
      <DetailGrid
        data={[
          {
            label: 'Victim Service Provider',
            value: organization?.victimServiceProvider ? 'Yes' : 'No',
          },
        ]}
      />
    )}
  </Grid>
);

export default OrganizationDetails;
