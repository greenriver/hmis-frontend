import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';

import { useCallback } from 'react';

import { useViewEditRecordDialogs } from '../form/hooks/useViewEditRecordDialogs';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { lastUpdatedBy, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  CustomCaseNoteFieldsFragment,
  DeleteCustomCaseNoteDocument,
  FormRole,
  GetEnrollmentCustomCaseNotesDocument,
  GetEnrollmentCustomCaseNotesQuery,
  GetEnrollmentCustomCaseNotesQueryVariables,
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

const columns: ColumnDef<CustomCaseNoteFieldsFragment>[] = [
  CASE_NOTE_COLUMNS.InformationDate,
  CASE_NOTE_COLUMNS.NoteContent,
  CASE_NOTE_COLUMNS.LastUpdated,
];

const EnrollmentCaseNotesPage = () => {
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
      formRole: FormRole.CaseNote,
      recordName: 'Case Note',
      evictCache,
      maxWidth: 'sm',
      deleteRecordDocument: DeleteCustomCaseNoteDocument,
      deleteRecordIdPath: 'deleteCustomCaseNote.customCaseNote.id',
    });

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
          columns={columns}
          pagePath='enrollment.customCaseNotes'
          noData='No case notes'
          headerCellSx={() => ({ color: 'text.secondary' })}
          handleRowClick={onSelectRecord}
          recordType='CustomCaseNote'
          paginationItemName='case note'
          showFilters
          noFilter
        />
      </TitleCard>
      {viewRecordDialog()}
      {editRecordDialog()}
    </>
  );
};

export default EnrollmentCaseNotesPage;
