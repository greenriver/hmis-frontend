import { Alert, AlertProps, AlertTitle, Box, Grid, Stack } from '@mui/material';
import { isEmpty } from 'lodash-es';

import ClientCustomDataElementsCard from '@/modules/client/components/ClientCustomDataElementsCard';
import ClientEnrollmentCard from '@/modules/client/components/ClientEnrollmentCard';
import ClientProfileCard from '@/modules/client/components/ClientProfileCard';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export interface Props {
  client: ClientFieldsFragment;
  notices?: ({
    id: string;
    content: React.ReactNode;
    title?: React.ReactNode;
  } & Omit<AlertProps, 'children'>)[];
}

const ProfileLayout: React.FC<Props> = ({ client, notices = [] }) => {
  const canViewEnrollments = client.access.canViewEnrollmentDetails;
  return (
    <Box data-testid='clientProfile'>
      <Grid container spacing={2}>
        {!isEmpty(notices) && (
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent='space-between'>
              {notices.map(({ content, title, id, ...props }) => (
                <Grid item xs={12}>
                  <Alert variant='filled' {...props} key={id}>
                    {title && <AlertTitle>{title}</AlertTitle>}
                    {content}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
        <Grid item md={12} lg={canViewEnrollments ? 6 : 8}>
          <Stack gap={2}>
            <ClientProfileCard client={client} />
            <ClientCustomDataElementsCard client={client} />
          </Stack>
        </Grid>
        {canViewEnrollments && (
          <Grid item md={12} lg={6}>
            <ClientEnrollmentCard client={client} />
          </Grid>
        )}
        {/* disabled "quick actions" card because the only action was Enroll in Project, which
          we are disabling for now #185750557 */}
        {/* <ClientActionsCard client={client} /> */}
      </Grid>
    </Box>
  );
};

export default ProfileLayout;
