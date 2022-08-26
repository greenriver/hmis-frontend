import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Stack, Button, Link, TableRow, TableCell } from '@mui/material';
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

  const actionRow = (
    <TableRow hover>
      <TableCell sx={{ backgroundColor: '#F0EDF3', py: 1, px: 3 }} colSpan={4}>
        + Add Household Member
      </TableCell>
    </TableRow>
  );
  return (
    <>
      <GenericTable<HouseholdClientFieldsFragment>
        rows={enrollment.household?.householdClients || []}
        columns={[
          {
            header: 'Household Member',
            render: (h) => (
              <Stack direction='row' alignItems='center' gap={1}>
                {h.relationshipToHoH === 'SELF_HEAD_OF_HOUSEHOLD_' && (
                  <PersonPinIcon fontSize='small' />
                )}
                {h.client.id === clientId ? (
                  clientName(h.client)
                ) : (
                  <Link
                    component={RouterLink}
                    to={generatePath(DashboardRoutes.PROFILE, {
                      clientId: h.client.id,
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
        ActionRowComponent={actionRow}
      />
      {/* <Box>+ Add Household Member</Box> */}
    </>
  );
};

export default HouseholdMemberTable;
