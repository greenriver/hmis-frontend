import AddIcon from '@mui/icons-material/Add';
import { Box, Button, TableCell, TableRow } from '@mui/material';

import { useCallback, useState } from 'react';

import { useViewEditRecordDialogs } from '../../form/hooks/useViewEditRecordDialogs';
import CommonTableDisplayToggle, {
  DisplayType,
} from '@/components/elements/CommonTableDisplayToggle';
import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import NotFound from '@/components/pages/NotFound';
import ClientCaseNoteCard from '@/modules/caseNotes/components/ClientCaseNoteCard';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import {
  getCustomDataElementColumns,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  CustomCaseNoteFieldsFragment,
  DataCollectionFeatureRole,
  DeleteCustomCaseNoteDocument,
  GetEnrollmentCustomCaseNotesDocument,
  GetEnrollmentCustomCaseNotesQuery,
  GetEnrollmentCustomCaseNotesQueryVariables,
  RecordFormRole,
} from '@/types/gqlTypes';

export const CASE_NOTE_COLUMNS: Record<
  string,
  ColumnDef<CustomCaseNoteFieldsFragment>
> = {
  InformationDate: {
    header: 'Information Date',
    key: 'informationDate',
    width: '150px',
    render: ({ informationDate }: CustomCaseNoteFieldsFragment) =>
      parseAndFormatDate(informationDate),
    sticky: 'left',
  },
  NoteContent: {
    header: 'Note Content',
    key: 'noteContent',
    render: ({ content }: CustomCaseNoteFieldsFragment) => (
      <Box
        sx={{
          whiteSpace: 'pre-wrap',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: '6',
          overflow: 'hidden',
        }}
      >
        {content}
      </Box>
    ),
  },
  NoteContentPreview: {
    header: 'Note Content Preview',
    key: 'contentPreview',
    render: ({ content }: CustomCaseNoteFieldsFragment) => (
      <Box
        sx={{
          whiteSpace: 'pre-wrap',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: '1',
          overflow: 'hidden',
          maxWidth: '200px',
        }}
      >
        {content}
      </Box>
    ),
  },
  LastUpdated: {
    header: 'Last Updated',
    key: 'lastUpdated',
    minWidth: '200px',
    render: ({ dateUpdated, user }: CustomCaseNoteFieldsFragment) => {
      if (dateUpdated)
        return (
          <RelativeDateDisplay
            dateString={dateUpdated}
            tooltipSuffixText={user ? `by ${user.name}` : undefined}
          />
        );
    },
  },
};

const EnrollmentCaseNotes = () => {
  const { enrollment, getEnrollmentFeature } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const canEdit = enrollment?.access?.canEditEnrollments || false;

  const evictCache = useCallback(() => {
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'customCaseNotes',
    });
  }, [enrollmentId]);

  const { onSelectRecord, viewRecordDialog, editRecordDialog, openFormDialog } =
    useViewEditRecordDialogs({
      variant: canEdit ? 'view_and_edit' : 'view_only',
      inputVariables: { enrollmentId },
      formRole: RecordFormRole.CaseNote,
      recordName: 'Case Note',
      evictCache,
      maxWidth: 'sm',
      deleteRecordDocument: DeleteCustomCaseNoteDocument,
      deleteRecordIdPath: 'deleteCustomCaseNote.customCaseNote.id',
      projectId: enrollment?.project.id,
    });

  // type of display (table or cards)
  const [displayType, setDisplayType] = useState<DisplayType>('table');

  const getColumnDefs = useCallback(
    (rows: CustomCaseNoteFieldsFragment[]) => {
      if (displayType === 'cards') return [];
      const customColumns = getCustomDataElementColumns(rows);
      return [
        CASE_NOTE_COLUMNS.InformationDate,
        ...customColumns,
        CASE_NOTE_COLUMNS.NoteContent,
        CASE_NOTE_COLUMNS.LastUpdated,
      ];
    },
    [displayType]
  );

  const caseNotesFeature = getEnrollmentFeature(
    DataCollectionFeatureRole.CaseNote
  );

  if (!enrollment || !enrollmentId || !clientId || !caseNotesFeature)
    return <NotFound />;

  return (
    <>
      <TitleCard
        title='Case Notes'
        headerVariant='border'
        headerComponent='h1'
        actions={
          canEdit &&
          !caseNotesFeature.legacy && (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add Case Note
            </Button>
          )
        }
      >
        <GenericTableWithData<
          GetEnrollmentCustomCaseNotesQuery,
          GetEnrollmentCustomCaseNotesQueryVariables,
          CustomCaseNoteFieldsFragment
        >
          queryVariables={{ id: enrollmentId }}
          queryDocument={GetEnrollmentCustomCaseNotesDocument}
          getColumnDefs={getColumnDefs}
          handleRowClick={(row) => onSelectRecord(row)}
          rowName={(row) => parseAndFormatDate(row.informationDate) || row.id}
          rowActionTitle='View Case Note'
          pagePath='enrollment.customCaseNotes'
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
                    <TableCell
                      sx={{ px: 0, py: 0 }}
                      colSpan={getColumnDefs([caseNote]).length}
                    >
                      <ClientCaseNoteCard
                        key={caseNote.id}
                        caseNote={caseNote}
                        sx={{ border: 'none' }}
                        client={enrollment.client}
                      />
                    </TableCell>
                  </TableRow>
                )
              : undefined
          }
        />
      </TitleCard>
      {viewRecordDialog()}
      {editRecordDialog()}
    </>
  );
};

export default EnrollmentCaseNotes;
