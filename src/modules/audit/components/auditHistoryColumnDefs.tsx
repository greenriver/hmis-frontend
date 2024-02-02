import { Stack, Typography } from '@mui/material';
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
import { AuditEventType } from '@/types/gqlTypes';

// todo @martha q on PR - maybe the best thing to do is have this be a graphql fragment,
// but I wasn't able to figure out how to define a fragment 'on' several different underlying types

// todo @martha q on PR - this is still code repetition (bc it also is defined in the graphql generated types),
// but to my mind it's better repetition than what we had before?
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
