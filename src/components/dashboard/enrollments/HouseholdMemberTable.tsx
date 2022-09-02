import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Stack, Button, Link, TableRow, TableCell } from '@mui/material';
import { useMemo } from 'react';
import {
  generatePath,
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';

import GenericTable from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import { clientName, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
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
  const navigate = useNavigate();
  const {
    data: { enrollment: enrollment } = {},
    loading,
    error,
  } = useGetEnrollmentWithHoHQuery({ variables: { id: enrollmentId } });

  const handleClickAddMembers = useMemo(() => {
    return () =>
      navigate(
        generatePath(DashboardRoutes.ADD_HOUSEHOLD_MEMBERS, {
          clientId,
          enrollmentId,
        })
      );
  }, [navigate, clientId, enrollmentId]);

  if (error) throw error;
  if (loading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

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
            render: (h) =>
              h.enrollment.entryDate
                ? parseAndFormatDate(h.enrollment.entryDate)
                : 'Unknown',
          },
          {
            header: 'Exit Date',
            render: (h) =>
              h.enrollment.exitDate
                ? parseAndFormatDate(h.enrollment.exitDate)
                : 'Active',
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
        actionRow={
          <TableRow
            onClick={handleClickAddMembers}
            onKeyUp={(event) =>
              event.key === 'Enter' && handleClickAddMembers()
            }
            hover
            tabIndex={0}
            sx={{
              backgroundColor: '#F0EDF3',
              py: 1,
              px: 3,
              '&:focus': { backgroundColor: '#e1dbe7' },
              '&:hover': {
                backgroundColor: '#e1dbe7 !important',
              },
              cursor: 'pointer',
            }}
          >
            <TableCell colSpan={4}>+ Add Household Member</TableCell>
          </TableRow>
        }
      />
    </>
  );
};

export default HouseholdMemberTable;
