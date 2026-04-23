import { useCallback } from 'react';
import { ContextualCollapsibleListsProvider } from '@/components/elements/CollapsibleListContext';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import useTableFilters from '@/hooks/useTableFilters';
import { AUDIT_HISTORY_COLUMNS } from '@/modules/audit/components/auditHistoryColumnDefs';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import {
  GetUserAuditEventsDocument,
  GetUserAuditEventsQuery,
  GetUserAuditEventsQueryVariables,
  UserAuditEventFieldsFragment,
  UserAuditEventFilterOptions,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const naText = <NotCollectedText>N/A</NotCollectedText>;
const columns: ColumnDef<UserAuditEventFieldsFragment>[] = [
  AUDIT_HISTORY_COLUMNS.timestamp,
  {
    header: 'Client Name',
    key: 'clientName',
    width: '180px',
    render: ({ clientName }) => clientName || naText,
  },
  {
    header: 'Project Name',
    key: 'projectName',
    width: '180px',
    render: ({ projectName }) => projectName || naText,
  },
  AUDIT_HISTORY_COLUMNS.action,
  AUDIT_HISTORY_COLUMNS.recordType,
  AUDIT_HISTORY_COLUMNS.fieldsChanged,
];

const UserAuditHistory = () => {
  const { userId } = useSafeParams() as { userId: string };
  const { filters, filterValues, setFilterValues } = useTableFilters({
    type: 'UserAuditEventFilterOptions',
  });

  const rowSecondaryActionConfigs = useCallback(
    ({
      projectName,
      clientId,
      clientName,
      enrollmentId,
      projectId,
    }: UserAuditEventFieldsFragment) => {
      const viewClient = clientId && {
        title: 'View Client',
        key: 'client',
        ariaLabel: `View Client ${clientName || clientId}`,
        to: generateSafePath(ClientDashboardRoutes.PROFILE, {
          clientId,
        }),
      };

      const viewEnrollment = clientId &&
        enrollmentId && {
          title: 'View Enrollment',
          key: 'enrollment',
          ariaLabel: `View Enrollment at ${projectName} for client ${clientName || clientId}`,
          to: generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId,
            enrollmentId,
          }),
        };

      const viewProject = projectId && {
        title: 'View Project',
        key: 'project',
        ariaLabel: `View Project ${projectName || projectId}`,
        to: generateSafePath(ProjectDashboardRoutes.OVERVIEW, {
          projectId,
        }),
      };

      return [viewClient, viewEnrollment, viewProject].filter(
        Boolean
      ) as CommonMenuItem[];
    },
    []
  );

  return (
    <>
      <ContextualCollapsibleListsProvider>
        <GenericTableWithData<
          GetUserAuditEventsQuery,
          GetUserAuditEventsQueryVariables,
          UserAuditEventFieldsFragment,
          UserAuditEventFilterOptions
        >
          columns={columns}
          fetchPolicy='cache-and-network'
          noData='No audit history'
          pagePath='user.auditHistory'
          paginationItemName='event'
          queryDocument={GetUserAuditEventsDocument}
          queryVariables={{ id: userId }}
          recordType='ApplicationUserAuditEvent'
          filters={filters}
          filterValues={filterValues}
          onFilterChange={setFilterValues}
          rowName={(row) =>
            `${row.clientName}'s ${row.recordName}, ${parseAndFormatDateTime(row.createdAt)}`
          }
          rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        />
      </ContextualCollapsibleListsProvider>
    </>
  );
};

export default UserAuditHistory;
