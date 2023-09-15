import AddIcon from '@mui/icons-material/Add';
import { Box, Button } from '@mui/material';
import { useCallback, useState } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import useViewDialog from '@/modules/form/hooks/useViewDialog';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  CustomCaseNoteFieldsFragment,
  DeleteCustomCaseNoteDocument,
  DeleteCustomCaseNoteMutation,
  DeleteCustomCaseNoteMutationVariables,
  FormRole,
  GetEnrollmentCustomCaseNotesDocument,
  GetEnrollmentCustomCaseNotesQuery,
  GetEnrollmentCustomCaseNotesQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<CustomCaseNoteFieldsFragment>[] = [
  {
    header: 'Content',
    render: ({ content }) => (
      <Box sx={{ whiteSpace: 'pre-wrap' }}>{content}</Box>
    ),
  },
  {
    header: 'Created by',
    width: '300px',
    render: ({ dateCreated, user }) => (
      <>
        {user ? <div>{user?.name}</div> : undefined}
        {parseAndFormatDateTime(dateCreated)}
      </>
    ),
  },
];

const EnrollmentCustomCaseNotesPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const [viewingRecord, setViewingRecord] = useState<
    CustomCaseNoteFieldsFragment | undefined
  >();

  const { openViewDialog, renderViewDialog, closeViewDialog } =
    useViewDialog<CustomCaseNoteFieldsFragment>({
      record: viewingRecord,
      onClose: () => setViewingRecord(undefined),
      formRole: FormRole.CustomCaseNote,
    });

  const { openFormDialog, renderFormDialog, closeDialog } =
    useFormDialog<CustomCaseNoteFieldsFragment>({
      formRole: FormRole.CustomCaseNote,
      onCompleted: () => {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'customCaseNotes',
        });
        setViewingRecord(undefined);
        closeViewDialog();
      },
      inputVariables: { enrollmentId },
      record: viewingRecord,
    });

  const onSuccessfulDelete = useCallback(() => {
    cache.evict({
      id: `Enrollment:${enrollmentId}`,
      fieldName: 'customCaseNotes',
    });
    closeDialog();
    closeViewDialog();
    setViewingRecord(undefined);
  }, [closeDialog, closeViewDialog, enrollmentId]);

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;
  const canEdit = enrollment.access.canEditEnrollments;

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
          handleRowClick={(record) => {
            setViewingRecord(record);
            openViewDialog();
          }}
        />
      </TitleCard>
      {renderViewDialog({
        title: 'View Case Note',
        maxWidth: 'sm',
        actions: (
          <>
            {viewingRecord && canEdit && (
              <>
                <Button variant='outlined' onClick={openFormDialog}>
                  Edit
                </Button>
                <DeleteMutationButton<
                  DeleteCustomCaseNoteMutation,
                  DeleteCustomCaseNoteMutationVariables
                >
                  queryDocument={DeleteCustomCaseNoteDocument}
                  variables={{ id: viewingRecord.id }}
                  idPath={'deleteCustomCaeNote.customCaseNote.id'}
                  recordName='Case Note'
                  onSuccess={onSuccessfulDelete}
                >
                  Delete
                </DeleteMutationButton>
              </>
            )}
          </>
        ),
      })}
      {renderFormDialog({
        title: viewingRecord ? 'Edit Case Note' : 'Add Case Note',
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};

export default EnrollmentCustomCaseNotesPage;
