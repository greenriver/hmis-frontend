import { Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import theme from '@/config/theme';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import ExternalSubmissionsViewModal from '@/modules/projects/components/ExternalSubmissionsViewModal';
import {
  ExternalFormSubmissionFilterOptions,
  ExternalFormSubmissionStatus,
  ExternalFormSubmissionSummaryFragment,
  GetProjectExternalFormSubmissionsDocument,
  GetProjectExternalFormSubmissionsQuery,
  GetProjectExternalFormSubmissionsQueryVariables,
} from '@/types/gqlTypes';

const ProjectExternalSubmissionsTable = ({
  projectId,
  formDefinitionIdentifier,
}: {
  projectId: string;
  formDefinitionIdentifier: string;
}) => {
  const getColumnDefs = useCallback(() => {
    return [
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
        render: (s: ExternalFormSubmissionSummaryFragment) =>
          parseAndFormatDateTime(s.submittedAt),
      },
    ];
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters = useFilters({
    type: 'ExternalFormSubmissionFilterOptions',
  });

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
        queryDocument={GetProjectExternalFormSubmissionsDocument}
        getColumnDefs={getColumnDefs}
        noData='No external form submissions'
        pagePath='project.externalFormSubmissions'
        recordType='ExternalFormSubmission'
        paginationItemName='submission'
        filters={filters}
        handleRowClick={(row) => setSelectedId(row.id)}
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
