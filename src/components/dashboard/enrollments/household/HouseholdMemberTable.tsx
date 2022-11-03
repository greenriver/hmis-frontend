// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';

import FinishIntakeButton from '../FinishIntakeButton';

import HohIndicatorTableCell from './HohIndicatorTableCell';

import GenericTable from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import {
  clientName,
  parseAndFormatDate,
  relationshipToHohForDisplay,
  sortHouseholdMembers,
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
  const {
    data: { enrollment: enrollment } = {},
    loading,
    error,
  } = useGetEnrollmentWithHoHQuery({
    variables: { id: enrollmentId },
  });

  const householdMembers = useMemo(
    () => sortHouseholdMembers(enrollment?.household.householdClients),
    [enrollment]
  );

  const columns = useMemo(() => {
    return [
      {
        header: '',
        key: 'indicator',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <HohIndicatorTableCell householdClient={hc} />
        ),
      },
      {
        header: 'Name',
        render: (h: HouseholdClientFieldsFragment) => {
          return h.client.id === clientId ? (
            clientName(h.client)
          ) : (
            <RouterLink
              to={generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
                clientId: h.client.id,
                enrollmentId,
              })}
              target='_blank'
              variant='body2'
            >
              {clientName(h.client)}
            </RouterLink>
          );
        },
      },
      {
        header: 'Start Date',
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.enrollment.entryDate
            ? parseAndFormatDate(hc.enrollment.entryDate)
            : 'Unknown',
      },
      {
        header: 'Exit Date',
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.enrollment.exitDate
            ? parseAndFormatDate(hc.enrollment.exitDate)
            : 'Active',
      },
      {
        header: 'Relationship to HoH',
        render: (hc: HouseholdClientFieldsFragment) =>
          relationshipToHohForDisplay(hc.relationshipToHoH),
      },
      {
        header: '',
        key: 'actions',
        render: (hc: HouseholdClientFieldsFragment) => (
          <FinishIntakeButton
            size='small'
            fullWidth
            enrollmentId={hc.enrollment.id}
            clientId={hc.client.id}
            enrollment={hc.enrollment}
          />
        ),
      },
    ];
  }, [clientId, enrollmentId]);

  if (error) throw error;
  if (loading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

  return (
    <GenericTable<HouseholdClientFieldsFragment>
      rows={householdMembers}
      columns={columns}
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
    />
  );
};

export default HouseholdMemberTable;
