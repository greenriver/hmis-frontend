import { Paper } from '@mui/material';

import { useMemo } from 'react';
import { CASE_NOTE_COLUMNS } from './EnrollmentCaseNotes';
import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useViewEditRecordDialogs } from '@/modules/form/hooks/useViewEditRecordDialogs';
import { entryExitRange, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  GetClientCaseNotesDocument,
  GetClientCaseNotesQuery,
  GetClientCaseNotesQueryVariables,
  RecordFormRole,
} from '@/types/gqlTypes';

type Row = NonNullable<
  GetClientCaseNotesQuery['client']
>['customCaseNotes']['nodes'][0];

const ClientCaseNotes = () => {
  const { client } = useClientDashboardContext();

  const clientId = client?.id;

  const { onSelectRecord, viewRecordDialog } = useViewEditRecordDialogs({
    variant: 'view_only',
    inputVariables: {},
    formRole: RecordFormRole.CaseNote,
    recordName: 'Case Note',
    maxWidth: 'sm',
  });

  const columns = useMemo(
    () => [
      CASE_NOTE_COLUMNS.InformationDate,
      {
        key: 'project',
        header: 'Project Name',
        render: (row: Row) => row.enrollment.projectName,
      },
      {
        ...CASE_NOTE_COLUMNS.LastUpdated,
        minWidth: '0',
      },
      CASE_NOTE_COLUMNS.NoteContentPreview,
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (row: Row) => (
          <TableRowActions
            record={row}
            recordName={`${parseAndFormatDate(row.informationDate)} at ${row.enrollment.projectName}`}
            menuActionConfigs={[
              {
                title: 'View Case Note',
                key: 'case note',
                ariaLabel: `View Case Note, ${parseAndFormatDate(row.informationDate)} at ${row.enrollment.projectName}`,
                onClick: () => onSelectRecord(row),
              },
              {
                ...getViewEnrollmentMenuItem(row.enrollment, client),
                // override the default ariaLabel to provide the project name, since we are in the client context
                ariaLabel: `View Enrollment at ${row.enrollment.projectName} for ${entryExitRange(row.enrollment)}`,
              },
            ]}
          />
        ),
      },
    ],
    [client, onSelectRecord]
  );

  if (!clientId) return <NotFound />;

  return (
    <>
      <PageTitle title='Case Notes' />
      <Paper>
        <GenericTableWithData<
          GetClientCaseNotesQuery,
          GetClientCaseNotesQueryVariables,
          Row
        >
          queryVariables={{ id: clientId }}
          queryDocument={GetClientCaseNotesDocument}
          columns={columns}
          handleRowClick={(row) => onSelectRecord(row)}
          pagePath='client.customCaseNotes'
          noData='No case notes'
          headerCellSx={() => ({ color: 'text.secondary' })}
          recordType='CustomCaseNote'
          paginationItemName='case note'
          showTopToolbar
        />
      </Paper>
      {viewRecordDialog()}
    </>
  );
};

export default ClientCaseNotes;
