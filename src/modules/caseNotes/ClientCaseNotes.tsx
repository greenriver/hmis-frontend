import { Paper } from '@mui/material';

import { useViewEditRecordDialogs } from '../form/hooks/useViewEditRecordDialogs';
import EnrollmentDateRangeWithStatus from '../hmis/components/EnrollmentDateRangeWithStatus';
import { CASE_NOTE_COLUMNS } from './EnrollmentCaseNotesPage';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import { useClientDashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  FormRole,
  GetClientCaseNotesDocument,
  GetClientCaseNotesQuery,
  GetClientCaseNotesQueryVariables,
} from '@/types/gqlTypes';

type Row = NonNullable<
  GetClientCaseNotesQuery['client']
>['customCaseNotes']['nodes'][0];

const columns: ColumnDef<Row>[] = [
  CASE_NOTE_COLUMNS.InformationDate,
  CASE_NOTE_COLUMNS.NoteContentPreview,
  {
    key: 'project',
    header: 'Project Name',
    render: (row) => row.enrollment.projectName,
  },
  {
    key: 'en-period',
    header: 'Enrollment Period',
    render: (row) => (
      <EnrollmentDateRangeWithStatus enrollment={row.enrollment} />
    ),
  },
];

const ClientCaseNotes = () => {
  const { client } = useClientDashboardContext();

  const clientId = client?.id;

  const { onSelectRecord, viewRecordDialog } = useViewEditRecordDialogs({
    variant: 'view_only',
    inputVariables: {},
    formRole: FormRole.CaseNote,
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
          columns={columns}
          pagePath='client.customCaseNotes'
          noData='No case notes'
          headerCellSx={() => ({ color: 'text.secondary' })}
          handleRowClick={onSelectRecord}
          recordType='CustomCaseNote'
          paginationItemName='case note'
          showFilters
          noFilter
        />
      </Paper>
      {viewRecordDialog()}
    </>
  );
};

export default ClientCaseNotes;
