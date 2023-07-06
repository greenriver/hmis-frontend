// import PersonPinIcon from '@mui/icons-material/PersonPin';
import { Box, Typography } from '@mui/material';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';

import HouseholdActionButtons from './HouseholdActionButtons';
import HouseholdMemberActionButton from './HouseholdMemberActionButton';
import { useHouseholdMembers } from './useHouseholdMembers';

import GenericTable from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import { useRecentAssessments } from '@/modules/assessments/components/useRecentAssessments';
import ClientName from '@/modules/client/components/ClientName';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ClientDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
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
  const [householdMembers, { loading: householdMembersLoading, error }] =
    useHouseholdMembers(enrollmentId);

  const { loading: assessmentsLoading, ...assessments } =
    useRecentAssessments(enrollmentId);

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
            ClientDashboardRoutes.VIEW_ENROLLMENT,
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
        header: 'Entry Date',
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.enrollment.entryDate
            ? parseAndFormatDate(hc.enrollment.entryDate)
            : 'Unknown',
      },
      {
        header: 'Status',
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.enrollment.exitDate ? (
            `Exited on ${parseAndFormatDate(hc.enrollment.exitDate)}`
          ) : hc.enrollment.inProgress ? (
            <Typography variant='body2' color='error'>
              Incomplete
            </Typography>
          ) : (
            'Active'
          ),
      },
      {
        header: 'Relationship to HoH',
        render: (hc: HouseholdClientFieldsFragment) => (
          <HmisEnum
            value={hc.relationshipToHoH}
            enumMap={{
              ...HmisEnums.RelationshipToHoH,
              [RelationshipToHoH.SelfHeadOfHousehold]: 'Self (HoH)',
            }}
          />
        ),
      },
      {
        header: '',
        key: 'actions',
        render: (hc: HouseholdClientFieldsFragment) =>
          hc.client.id === clientId ? (
            <ClientPermissionsFilter
              id={clientId}
              permissions={['canEditEnrollments']}
            >
              <HouseholdMemberActionButton
                size='small'
                variant='outlined'
                fullWidth
                enrollmentId={hc.enrollment.id}
                clientId={hc.client.id}
                enrollment={hc.enrollment}
                {...assessments}
              />
            </ClientPermissionsFilter>
          ) : null,
      },
    ];
  }, [clientId, assessments]);

  if (error) throw error;
  if (householdMembersLoading && !householdMembers) return <Loading />;
  if (assessmentsLoading && isEmpty(assessments)) return <Loading />;

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
          'td:last-child': {
            py: 0,
            whiteSpace: 'nowrap',
            width: '1%',
          },
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
