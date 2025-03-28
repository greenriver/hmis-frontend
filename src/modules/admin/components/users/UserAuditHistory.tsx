import { useCallback } from 'react';
import { ContextualCollapsibleListsProvider } from '@/components/elements/CollapsibleListContext';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import { AUDIT_HISTORY_COLUMNS } from '@/modules/audit/components/auditHistoryColumnDefs';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
  ProjectDashboardRoutes,
} from '@/routes/routes';
import {
  GetUserAuditEventsDocument,
  GetUserAuditEventsQuery,
  GetUserAuditEventsQueryVariables,
  UserAuditEventFilterOptions,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type AuditHistoryType = NonNullable<
  NonNullable<GetUserAuditEventsQuery['user']>['auditHistory']
>['nodes'][0];

const naText = <NotCollectedText>N/A</NotCollectedText>;
const columns: ColumnDef<AuditHistoryType>[] = [
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
  const filters = useFilters({
    type: 'UserAuditEventFilterOptions',
  });

  const rowSecondaryActionConfigs = useCallback(
    ({ projectName, clientId, enrollmentId, projectId }: AuditHistoryType) => {
      const viewClient = clientId && {
        title: 'View Client',
        key: 'client',
        ariaLabel: `View Client ${clientId}`,
        to: generateSafePath(ClientDashboardRoutes.PROFILE, {
          clientId,
        }),
      };

      const viewEnrollment = clientId &&
        enrollmentId && {
          title: 'View Enrollment',
          key: 'enrollment',
          ariaLabel: `View Enrollment at ${projectName} for client ${clientId}`,
          to: generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId,
            enrollmentId,
          }),
        };

      const viewProject = projectId && {
        title: 'View Project',
        key: 'project',
        ariaLabel: `View Project ${projectId}`,
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
          AuditHistoryType,
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
          rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        />
      </ContextualCollapsibleListsProvider>
    </>
  );
};

export default UserAuditHistory;
