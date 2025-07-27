import { Paper, TableCell, TableRow } from '@mui/material';
import { useMemo, useState } from 'react';
import { CASE_NOTE_COLUMNS } from './EnrollmentCaseNotes';
import CommonTableDisplayToggle, {
  DisplayType,
} from '@/components/elements/CommonTableDisplayToggle';
import { getViewEnrollmentMenuItem } from '@/components/elements/table/tableRowActionUtil';
import PageTitle from '@/components/layout/PageTitle';
import PrintViewButton from '@/components/layout/PrintViewButton';
import NotFound from '@/components/pages/NotFound';
import ClientCaseNoteCard from '@/modules/caseNotes/components/ClientCaseNoteCard';
import useClientDashboardContext from '@/modules/client/hooks/useClientDashboardContext';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { WITH_ENROLLMENT_COLUMNS } from '@/modules/enrollment/columns/enrollmentColumns';
import { useViewEditRecordDialogs } from '@/modules/form/hooks/useViewEditRecordDialogs';
import { entryExitRange, parseAndFormatDate } from '@/modules/hmis/hmisUtil';

import { ClientDashboardRoutes } from '@/routes/routes';
import {
  GetClientCaseNotesDocument,
  GetClientCaseNotesQuery,
  GetClientCaseNotesQueryVariables,
  RecordFormRole,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

type Row = NonNullable<
  GetClientCaseNotesQuery['client']
>['customCaseNotes']['nodes'][0];

const COLUMNS: DataColumnDef<Row, GetClientCaseNotesQueryVariables>[] = [
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
  {
    ...WITH_ENROLLMENT_COLUMNS.entryDate,
    optional: {
      defaultHidden: true,
      // no queryVariableField, since we need to fetch entryDate anyway in order to correctly aria-label the row action
    },
  },
  WITH_ENROLLMENT_COLUMNS.exitDate,
  WITH_ENROLLMENT_COLUMNS.organizationName,
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

  // type of display (table or cards)
  const [displayType, setDisplayType] = useState<DisplayType>('table');

  const columns = useMemo(() => {
    return displayType === 'cards' ? [] : COLUMNS;
  }, [displayType]);

  if (!clientId) return <NotFound />;

  return (
    <>
      <PageTitle
        title='Case Notes'
        actions={
          <PrintViewButton
            openInNew
            to={generateSafePath(ClientDashboardRoutes.PRINT_ALL_CASE_NOTES, {
              clientId,
            })}
          >
            Print
          </PrintViewButton>
        }
      />
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
          tableDisplayOptionButtons={
            <CommonTableDisplayToggle
              value={displayType}
              onChange={setDisplayType}
            />
          }
          renderRow={
            displayType === 'cards'
              ? (caseNote) => (
                  <TableRow key={caseNote.id}>
                    <TableCell colSpan={columns.length} sx={{ px: 0, py: 0 }}>
                      <ClientCaseNoteCard
                        key={caseNote.id}
                        caseNote={caseNote}
                        sx={{ border: 'none' }}
                        client={client}
                        linkToEnrollment
                      />
                    </TableCell>
                  </TableRow>
                )
              : undefined
          }
        />
      </Paper>
      {viewRecordDialog()}
    </>
  );
};

export default ClientCaseNotes;
