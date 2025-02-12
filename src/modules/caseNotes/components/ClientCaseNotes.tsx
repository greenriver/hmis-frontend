import { Paper } from '@mui/material';
import { CASE_NOTE_COLUMNS } from './EnrollmentCaseNotes';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
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

const COLUMNS: ColumnDef<Row>[] = [
  CASE_NOTE_COLUMNS.InformationDate,
  {
    key: 'project',
    header: 'Project Name',
    render: (row: Row) => row.enrollment.projectName,
    maxWidth: '200px',
  },
  {
    ...CASE_NOTE_COLUMNS.LastUpdated,
    minWidth: '0',
  },
  CASE_NOTE_COLUMNS.NoteContentPreview,
];

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
          columns={COLUMNS}
          handleRowClick={(row) => onSelectRecord(row)}
          rowName={(row) =>
            `${parseAndFormatDate(row.informationDate)} at ${row.enrollment.projectName}`
          }
          rowActionTitle='View Case Note'
          rowSecondaryActionConfigs={(row) => [
            {
              ...getViewEnrollmentMenuItem(row.enrollment, client),
              // override the default ariaLabel to provide the project name, since we are in the client context
              ariaLabel: `View Enrollment at ${row.enrollment.projectName} for ${entryExitRange(row.enrollment)}`,
            },
          ]}
          pagePath='client.customCaseNotes'
          noData='No case notes'
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
