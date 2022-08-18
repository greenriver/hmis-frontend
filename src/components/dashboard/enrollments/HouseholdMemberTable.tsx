import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Stack, Button, Link } from '@mui/material';
import { generatePath, Link as RouterLink } from 'react-router-dom';

import GenericTable from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import { clientName } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  useGetEnrollmentWithHoHQuery,
} from '@/types/gqlTypes';

const HouseholdMemberTable = ({
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
}) => {
  const {
    data: { enrollment: enrollment } = {},
    loading,
    error,
  } = useGetEnrollmentWithHoHQuery({ variables: { id: enrollmentId } });

  if (error) throw error;
  if (loading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

  return (
    <GenericTable<HouseholdClientFieldsFragment>
      rows={enrollment.household?.householdClients || []}
      columns={[
        {
          header: 'Household Member',
          render: (h) => (
            <Stack direction='row' alignItems='center' gap={1}>
              {h.relationshipToHoH === '1' && (
                <PersonPinIcon fontSize='small' />
              )}
              {h.client.id === clientId ? (
                clientName(h.client)
              ) : (
                <Link
                  component={RouterLink}
                  to={generatePath(DashboardRoutes.PROFILE, {
                    clientId,
                  })}
                  target='_blank'
                  variant='body2'
                >
                  {clientName(h.client)}
                </Link>
              )}
            </Stack>
          ),
        },
        {
          header: 'Start Date',
          render: () => null,
        },
        {
          header: 'Exit Date',
          render: () => null,
        },
        {
          header: 'Actions',
          render: () => (
            <Stack direction='row' spacing={1}>
              <Button variant='outlined' color='info' size='small'>
                Edit
              </Button>
              <Button variant='outlined' color='error' size='small'>
                Exit
              </Button>
            </Stack>
          ),
        },
      ]}
    />
  );
};

export default HouseholdMemberTable;
