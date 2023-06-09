import { Card, Grid, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';

const AddClientPrompt = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  return (
    <RootPermissionsFilter permissions='canEditClients'>
      <Grid item>
        <Card sx={{ pl: 2, py: 1.5, pr: 1, mt: 1 }}>
          <Stack direction='row' spacing={3} sx={{ alignItems: 'center' }}>
            <Typography variant='body1'>
              {t<string>('clientSearch.addClientPrompt')}
            </Typography>
            {children}
          </Stack>
        </Card>
      </Grid>
    </RootPermissionsFilter>
  );
};

export default AddClientPrompt;
