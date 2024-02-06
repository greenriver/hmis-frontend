import { Link, Stack, Typography } from '@mui/material';
import { compact, filter } from 'lodash-es';
import {
  ContextualCollapsibleList,
  ContextualListExpansionButton,
} from '@/components/elements/CollapsibleListContext';
import { ColumnDef } from '@/components/elements/table/types';
import AuditObjectChangesSummary, {
  ObjectChangesType,
} from '@/modules/audit/components/AuditObjectChangesSummary';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import RelativeDateTableCellContents from '@/modules/hmis/components/RelativeDateTableCellContents';
import { auditActionForDisplay } from '@/modules/hmis/hmisUtil';
import { Routes } from '@/routes/routes';
import { AuditEventType } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

export type AuditHistoryNode = NonNullable<{
  id: string;
  createdAt: string;
  event: AuditEventType;
  objectChanges?: any | null;
  recordName: string;
  graphqlType: string;
  recordId: string;
  user?: {
    id: string;
    name: string;
  } | null;
  trueUser?: {
    id: string;
    name: string;
  } | null;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  enrollmentId?: string;
}>;

export const auditHistoryColumns: ColumnDef<AuditHistoryNode>[] = [
  {
    key: 'timestamp',
    header: 'Timestamp',
    width: '180px',
    render: (e) => (
      <RelativeDateTableCellContents dateTimeString={e.createdAt} />
    ),
  },
  {
    key: 'user',
    header: 'User',
    width: '180px',
    render: ({ user, trueUser }) =>
      compact([trueUser?.name, user?.name]).join(' acting as '),
  },
  {
    key: 'clientName',
    header: 'Client Name',
    width: '180px',
    render: ({ clientName, clientId }) => {
      if (!clientName) return;
      if (clientName && clientId) {
        return (
          <Link
            href={generateSafePath(Routes.CLIENT_DASHBOARD, {
              clientId: clientId,
            })}
          >
            {clientName}
          </Link>
        );
      }
      return clientName; // Should never get here, but just in case
    },
  },
  {
    key: 'projectName',
    header: 'Project Name',
    width: '180px',
    render: ({ projectName, clientId, enrollmentId, projectId }) => {
      if (!projectName) return;
      if (clientId && enrollmentId) {
        // Link to the enrollment
        return (
          <Link
            href={generateSafePath(Routes.ENROLLMENT_DASHBOARD, {
              enrollmentId: enrollmentId,
              clientId: clientId,
            })}
          >
            {projectName}
          </Link>
        );
      }
      if (projectId) {
        return (
          <Link
            href={generateSafePath(Routes.PROJECT, { projectId: projectId })}
          >
            {projectName}
          </Link>
        );
      }
      return projectName; // Should never get here, but just in case
    },
  },
  {
    key: 'action',
    header: 'Action',
    width: '100px',
    render: ({ event }) => auditActionForDisplay(event),
  },
  {
    key: 'recordType',
    header: 'Record Type',
    width: '180px',
    render: ({ recordName, recordId }) => {
      return (
        <Stack>
          <Typography variant='inherit'>{recordName}</Typography>
          <Typography
            color='text.secondary'
            variant='inherit'
          >{`ID: ${recordId}`}</Typography>
        </Stack>
      );
    },
  },
  {
    key: 'fieldsChanged',
    header: (
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <strong>Fields Changed</strong>
        <ContextualListExpansionButton />
      </Stack>
    ),
    tableCellProps: {
      sx: { p: 0, backgroundColor: (theme) => theme.palette.grey[50] },
    },
    render: (e) => {
      if (!e.objectChanges || Object.keys(e.objectChanges).length === 0) {
        return null;
      }

      const labels = Object.values(e.objectChanges as ObjectChangesType)
        .filter((r) => filter(r.values, hasMeaningfulValue).length > 0)
        .map((val) => val.displayName);

      return (
        <ContextualCollapsibleList title={labels.join(', ')}>
          <AuditObjectChangesSummary
            objectChanges={e.objectChanges as ObjectChangesType}
            recordType={e.graphqlType}
            eventType={e.event}
          />
        </ContextualCollapsibleList>
      );
    },
  },
];
