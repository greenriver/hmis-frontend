import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';

import { useCallback } from 'react';

import { useViewEditRecordDialogs } from '../form/hooks/useViewEditRecordDialogs';
import { cache } from '@/app/apolloClient';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  getCustomDataElementColumns,
  lastUpdatedBy,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import {
  CustomCaseNoteFieldsFragment,
  DeleteCustomCaseNoteDocument,
  GetEnrollmentCustomCaseNotesDocument,
  GetEnrollmentCustomCaseNotesQuery,
  GetEnrollmentCustomCaseNotesQueryVariables,
  RecordFormRole,
} from '@/types/gqlTypes';

export const CASE_NOTE_COLUMNS = {
  InformationDate: {
    header: 'Information Date',
    width: '150px',
    render: ({ informationDate }: CustomCaseNoteFieldsFragment) =>
      parseAndFormatDate(informationDate),
    linkTreatment: true,
  },
  NoteContent: {
    header: 'Note',
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
    key: 'content-preview',
    header: 'Note',
    maxWidth: '450px',
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
    minWidth: '200px',
    render: ({ dateUpdated, user }: CustomCaseNoteFieldsFragment) =>
      lastUpdatedBy(dateUpdated, user),
  },
};

const EnrollmentCaseNotes = () => {
  const { enrollment } = useEnrollmentDashboardContext();
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

  const getColumnDefs = useCallback((rows: CustomCaseNoteFieldsFragment[]) => {
    const customColumns = getCustomDataElementColumns(rows);
    return [
      CASE_NOTE_COLUMNS.InformationDate,
      ...customColumns,
      CASE_NOTE_COLUMNS.NoteContent,
      CASE_NOTE_COLUMNS.LastUpdated,
    ];
  }, []);

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <>
      <TitleCard
        title='Case Notes'
        headerVariant='border'
        actions={
          canEdit ? (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add Case Note
            </Button>
          ) : null
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
          pagePath='enrollment.customCaseNotes'
          noData='No case notes'
          headerCellSx={() => ({ color: 'text.secondary' })}
          handleRowClick={onSelectRecord}
          recordType='CustomCaseNote'
          paginationItemName='case note'
          showTopToolbar
        />
      </TitleCard>
      {viewRecordDialog()}
      {editRecordDialog()}
    </>
  );
};

export default EnrollmentCaseNotes;
