// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Button, Link, TableCell, TableRow } from '@mui/material';
import { sortBy } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import {
  generatePath,
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';

import HohIndicatorTableCell from './HohIndicatorTableCell';

import GenericTable from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import {
  clientName,
  parseAndFormatDate,
  relationshipToHohForDisplay,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  useGetEnrollmentWithHoHQuery,
} from '@/types/gqlTypes';

/**
 * Table showing all members that belong to a given household
 */
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
  } = useGetEnrollmentWithHoHQuery({
    variables: { id: enrollmentId },
    // fetchPolicy: 'cache-and-network',
  });

  const handleClickAddMembers = useCallback(
    () =>
      navigate(
        generatePath(`${DashboardRoutes.EDIT_HOUSEHOLD}#add`, {
          clientId,
          enrollmentId,
        })
      ),
    [navigate, clientId, enrollmentId]
  );

  const householdMembers = useMemo(() => {
    if (!enrollment?.household?.householdClients) return [];
    const clients = enrollment?.household?.householdClients || [];
    return sortBy(clients, [(c) => c.client.lastName || c.client.id]);
  }, [enrollment]);

  if (error) throw error;
  if (loading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

  return (
    <>
      <GenericTable<HouseholdClientFieldsFragment>
        rows={householdMembers}
        columns={[
          {
            header: '',
            key: 'indicator',
            width: '1%',
            render: (hc) => <HohIndicatorTableCell householdClient={hc} />,
          },
          {
            header: 'Name',
            render: (h) => {
              return h.client.id === clientId ? (
                clientName(h.client)
              ) : (
                <Link
                  component={RouterLink}
                  to={generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
                    clientId: h.client.id,
                    enrollmentId,
                  })}
                  target='_blank'
                  variant='body2'
                >
                  {clientName(h.client)}
                </Link>
              );
            },
          },
          {
            header: 'Start Date',
            render: (hc) =>
              hc.enrollment.entryDate
                ? parseAndFormatDate(hc.enrollment.entryDate)
                : 'Unknown',
          },
          {
            header: 'Exit Date',
            render: (hc) =>
              hc.enrollment.exitDate
                ? parseAndFormatDate(hc.enrollment.exitDate)
                : 'Active',
          },
          {
            header: 'Relationship to HoH',
            render: (hc) => relationshipToHohForDisplay(hc.relationshipToHoH),
          },
          {
            header: '',
            key: 'actions',
            render: (hc) =>
              hc.enrollment.inProgress ? (
                <Button variant='outlined' color='error' size='small' fullWidth>
                  Finish Intake
                </Button>
              ) : (
                <Button variant='outlined' size='small' fullWidth>
                  Exit
                </Button>
              ),
          },
        ]}
        rowSx={(hc) => ({
          borderLeft:
            hc.client.id === clientId
              ? (theme) => `3px solid ${theme.palette.secondary.main}`
              : undefined,
          'td:nth-of-type(1)': { px: 0 },
          'td:last-child': {
            whiteSpace: 'nowrap',
            width: '1%',
          },
        })}
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
              py: 3,
              px: 3,
              '&:focus': { backgroundColor: '#e1dbe7' },
              '&:hover': {
                backgroundColor: '#e1dbe7 !important',
              },
              cursor: 'pointer',
            }}
          >
            <TableCell colSpan={1}></TableCell>
            <TableCell colSpan={5} sx={{ py: 1.2 }}>
              + Add Household Member
            </TableCell>
          </TableRow>
        }
      />
    </>
  );
};

export default HouseholdMemberTable;
