// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Box } from '@mui/material';
import { useMemo } from 'react';

import { useHouseholdMembers } from '../hooks/useHouseholdMembers';

import HouseholdActionButtons from './elements/HouseholdActionButtons';

import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import ClientName from '@/modules/client/components/ClientName';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { HouseholdClientFieldsFragment } from '@/types/gqlTypes';
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
  const [householdMembers, { loading: householdMembersLoading, error }] =
    useHouseholdMembers(enrollmentId);

  const columns = useMemo(() => {
    return [
      {
        header: '',
        key: 'indicator',
        width: '1%',
        render: (hc: HouseholdClientFieldsFragment) => (
          <HohIndicator relationshipToHoh={hc.relationshipToHoH} />
        ),
      },
      {
        header: 'Name',
        render: (h: HouseholdClientFieldsFragment) => {
          const isCurrentClient = h.client.id === clientId;
          const viewEnrollmentPath = generateSafePath(
            EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
            {
              clientId: h.client.id,
              enrollmentId: h.enrollment.id,
            }
          );
          const routerLinkProps = isCurrentClient
            ? undefined
            : {
                to: viewEnrollmentPath,
                target: '_blank',
              };

          return (
            <ClientName
              client={h.client}
              routerLinkProps={routerLinkProps}
              bold={isCurrentClient}
            />
          );
        },
      },
      {
        header: 'Relation to HoH',
        render: (hc: HouseholdClientFieldsFragment) => (
          <HmisEnum
            value={hc.relationshipToHoH}
            enumMap={HmisEnums.RelationshipToHoH}
          />
        ),
      },
      // {
      //   header: 'Entry Date',
      //   render: (hc: HouseholdClientFieldsFragment) =>
      //     hc.enrollment.entryDate
      //       ? parseAndFormatDate(hc.enrollment.entryDate)
      //       : 'Unknown',
      // },
      {
        header: 'Status',
        render: (hc: HouseholdClientFieldsFragment) => (
          <EnrollmentStatus enrollment={hc.enrollment} />
        ),
        // hc.enrollment.exitDate ? (
        //   `Exited on ${parseAndFormatDate(hc.enrollment.exitDate)}`
        // ) : hc.enrollment.inProgress ? (
        //   <Typography variant='body2' color='error'>
        //     Incomplete
        //   </Typography>
        // ) : (
        //   'Active'
        // ),
      },
    ];
  }, [clientId]);

  if (error) throw error;
  if (householdMembersLoading && !householdMembers) return <Loading />;

  return (
    <>
      <GenericTable<HouseholdClientFieldsFragment>
        rows={householdMembers || []}
        columns={columns}
        rowSx={() => ({
          td: { py: 2 },
          // HoH indicator column
          'td:nth-of-type(1)': { pl: 1, pr: 0 },
          // Button column
          // 'td:last-child': {
          //   py: 0,
          //   whiteSpace: 'nowrap',
          //   width: '1%',
          // },
        })}
      />
      <ClientPermissionsFilter
        id={clientId}
        permissions={['canEditEnrollments']}
      >
        <Box sx={{ px: 3 }}>
          <HouseholdActionButtons
            householdMembers={householdMembers || []}
            clientId={clientId}
            enrollmentId={enrollmentId}
          />
        </Box>
      </ClientPermissionsFilter>
    </>
  );
};

export default HouseholdMemberTable;
