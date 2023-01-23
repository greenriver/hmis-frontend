import { Alert, AlertProps, AlertTitle, Box, Grid } from '@mui/material';
import { isEmpty } from 'lodash-es';

import ClientActionsCard from '@/components/elements/ClientActionsCard';
import ClientEnrollmentCard from '@/components/elements/ClientEnrollmentCard';
import ClientProfileCard from '@/components/elements/ClientProfileCard';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export interface Props {
  client: ClientFieldsFragment;
  notices?: ({ content: React.ReactNode; title?: React.ReactNode } & Omit<
    AlertProps,
    'children'
  >)[];
}

const ProfileLayout: React.FC<Props> = ({ client, notices = [] }) => {
  return (
    <Box data-testid='clientProfile'>
      <Grid container spacing={2}>
        {!isEmpty(notices) && (
          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent='space-between'>
              {notices.map(({ content, title, ...props }, i) => (
                <Grid item xs={12}>
                  <Alert variant='filled' {...props} key={i}>
                    {title && <AlertTitle>{title}</AlertTitle>}
                    {content}
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Grid>
        )}
        <Grid item md={12} lg={6}>
          <ClientProfileCard client={client} />
        </Grid>
        <Grid item md={12} lg={6}>
          <ClientActionsCard client={client} />
          <ClientEnrollmentCard client={client} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfileLayout;
