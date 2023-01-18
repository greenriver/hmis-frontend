import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Stack } from '@mui/material';
import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import { DashboardRoutes } from '@/routes/routes';
interface Props {
  enrollmentId: string;
  clientId: string;
}

const HouseholdActionButtons = ({ enrollmentId, clientId }: Props) => {
  const editHouseholdPath = useMemo(
    () =>
      generatePath(DashboardRoutes.EDIT_HOUSEHOLD, {
        clientId,
        enrollmentId,
      }),
    [clientId, enrollmentId]
  );
  const exitPath = useMemo(
    () =>
      generatePath(DashboardRoutes.EXIT_HOUSEHOLD, {
        clientId,
        enrollmentId,
      }),
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
        to={editHouseholdPath}
      >
        Manage Household
      </ButtonLink>
      <ButtonLink
        // disabled
        variant='outlined'
        color='error'
        startIcon={<ExitToAppIcon fontSize='small' />}
        to={exitPath}
      >
        Exit Household
      </ButtonLink>
    </Stack>
  );
};

export default HouseholdActionButtons;
