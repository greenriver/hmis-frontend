// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { useMemo } from 'react';

import HohIndicatorTableCell from './HohIndicatorTableCell';

import HouseholdMemberActionButton from '@/components/dashboard/enrollments/HouseholdMemberActionButton';
import { useRecentAssessments } from '@/components/dashboard/enrollments/useRecentAssessments';
import ClientName from '@/components/elements/ClientName';
import GenericTable from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import {
  parseAndFormatDate,
  relationshipToHohForDisplay,
  sortHouseholdMembers,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  useGetEnrollmentWithHoHQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

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

  const { loading: assessmentsLoading, ...assessments } =
    useRecentAssessments(enrollmentId);

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
          const viewEnrollmentPath = generateSafePath(
            DashboardRoutes.VIEW_ENROLLMENT,
            {
              clientId: h.client.id,
              enrollmentId,
            }
          );
          const routerLinkProps =
            h.client.id !== clientId
              ? {
                  to: viewEnrollmentPath,
                  target: '_blank',
                }
              : undefined;

          return (
            <ClientName client={h.client} routerLinkProps={routerLinkProps} />
          );
        },
      },
      {
        header: 'Entry Date',
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.enrollment.entryDate
            ? parseAndFormatDate(hc.enrollment.entryDate)
            : 'Unknown',
      },
      {
        header: 'Status',
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.enrollment.exitDate
            ? `Exited on ${parseAndFormatDate(hc.enrollment.exitDate)}`
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
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.client.id === clientId ? (
            <HouseholdMemberActionButton
              size='small'
              variant='outlined'
              fullWidth
              enrollmentId={hc.enrollment.id}
              clientId={hc.client.id}
              enrollment={hc.enrollment}
              {...assessments}
            />
          ) : null,
      },
    ];
  }, [clientId, enrollmentId, assessments]);

  if (error) throw error;
  if (loading || assessmentsLoading) return <Loading />;
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
