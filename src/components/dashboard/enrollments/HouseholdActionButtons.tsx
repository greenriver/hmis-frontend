import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Stack } from '@mui/material';
import { useCallback } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import { DashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';
interface Props {
  enrollmentId: string;
  clientId: string;
}

const HouseholdActionButtons = ({ enrollmentId, clientId }: Props) => {
  const buildPath = useCallback(
    (route: string) => generateSafePath(route, { clientId, enrollmentId }),
    [clientId, enrollmentId]
  );

  // TODO: disable exit household button if not applicable:
  // only 1 member
  // any enrollments are WIP

  return (
    <Stack direction='row' gap={3} sx={{ mt: 4, mb: 2 }}>
      <ButtonLink
        variant='outlined'
        color='secondary'
        startIcon={<EditIcon fontSize='small' />}
        to={buildPath(DashboardRoutes.EDIT_HOUSEHOLD)}
      >
        Manage Household
      </ButtonLink>
      <ButtonLink
        // disabled
        variant='outlined'
        color='error'
        startIcon={<ExitToAppIcon fontSize='small' />}
        to={buildPath(DashboardRoutes.HOUSEHOLD_EXIT)}
      >
        Exit Household
      </ButtonLink>
      <ButtonLink
        // disabled
        variant='outlined'
        color='error'
        startIcon={<ExitToAppIcon fontSize='small' />}
        to={buildPath(DashboardRoutes.HOUSEHOLD_INTAKE)}
      >
        Enter Household
      </ButtonLink>
    </Stack>
  );
};

export default HouseholdActionButtons;
