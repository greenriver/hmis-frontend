import { Button, Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import LoadingButton from '@/components/elements/LoadingButton';
import theme from '@/config/theme';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import RelativeDateTableCellContents from '@/modules/hmis/components/RelativeDateTableCellContents';
import { useFilters } from '@/modules/hmis/filterUtil';
import ExternalSubmissionsViewModal from '@/modules/projects/components/ExternalSubmissionsViewModal';
import {
  ExternalFormSubmissionFilterOptions,
  ExternalFormSubmissionStatus,
  ExternalFormSubmissionSummaryFragment,
  GetProjectExternalFormSubmissionsDocument,
  GetProjectExternalFormSubmissionsQuery,
  GetProjectExternalFormSubmissionsQueryVariables,
  useBulkReviewExternalSubmissionsMutation,
} from '@/types/gqlTypes';

const ProjectExternalSubmissionsTable = ({
  projectId,
  formDefinitionIdentifier,
}: {
  projectId: string;
  formDefinitionIdentifier: string;
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [bulkUpdate, { loading: bulkLoading, error: bulkError }] =
    useBulkReviewExternalSubmissionsMutation({
      refetchQueries: [GetProjectExternalFormSubmissionsDocument],
      awaitRefetchQueries: true,
    });

  const getColumnDefs = useCallback(() => {
    return [
      {
        header: 'ID',
        render: (s: ExternalFormSubmissionSummaryFragment) => s.id,
      },
      {
        header: 'Status',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionSummaryFragment) => {
          const isNew = s.status === ExternalFormSubmissionStatus.New;
          return (
            <>
              <Chip
                label={capitalize(s.status)}
                size='small'
                color={isNew ? 'primary' : 'default'}
                variant={isNew ? 'filled' : 'outlined'}
                sx={isNew ? {} : { color: theme.palette.text.secondary }}
              />
              {s.spam && (
                <Chip
                  label='Spam'
                  size='small'
                  color='error'
                  variant='outlined'
                  sx={{ ml: 1, color: theme.palette.error.dark }}
                />
              )}
            </>
          );
        },
      },
      {
        header: 'Date Submitted',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionSummaryFragment) => (
          <RelativeDateTableCellContents
            dateTimeString={s.submittedAt}
            horizontal
          />
        ),
      },
      {
        header: 'Action',
        render: (s: ExternalFormSubmissionSummaryFragment) => (
          <Button
            variant='outlined'
            onClick={() => setSelectedId(s.id)}
            disabled={bulkLoading}
          >
            View
          </Button>
        ),
      },
    ];
  }, [setSelectedId, bulkLoading]);

  const filters = useFilters({
    type: 'ExternalFormSubmissionFilterOptions',
  });

  if (bulkError) throw bulkError;

  return (
    <>
      <GenericTableWithData<
        GetProjectExternalFormSubmissionsQuery,
        GetProjectExternalFormSubmissionsQueryVariables,
        ExternalFormSubmissionSummaryFragment,
        ExternalFormSubmissionFilterOptions
      >
        queryVariables={{
          id: projectId,
          formDefinitionIdentifier: formDefinitionIdentifier,
        }}
        selectable='checkbox'
        isRowSelectable={(s) =>
          s.status === ExternalFormSubmissionStatus.New && !s.spam
        }
        queryDocument={GetProjectExternalFormSubmissionsDocument}
        getColumnDefs={getColumnDefs}
        noData='No external form submissions'
        pagePath='project.externalFormSubmissions'
        recordType='ExternalFormSubmission'
        paginationItemName='submission'
        filters={filters}
        EnhancedTableToolbarProps={{
          title: 'Form Submissions',
          renderBulkAction: (selectedIds, selectedRows) => (
            <LoadingButton
              onClick={() => {
                bulkUpdate({
                  variables: {
                    ids: selectedIds as string[],
                  },
                });
              }}
              loading={bulkLoading}
            >
              Bulk Review ({selectedRows.length}) Submissions
            </LoadingButton>
          ),
        }}
      />
      {selectedId && (
        <ExternalSubmissionsViewModal
          submissionId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
};

export default ProjectExternalSubmissionsTable;
