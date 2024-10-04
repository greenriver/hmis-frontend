import { Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import Loading from '@/components/elements/Loading';
import theme from '@/config/theme';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  getCustomDataElementColumns,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import ExternalSubmissionsViewModal from '@/modules/projects/components/ExternalSubmissionsViewModal';
import {
  ExternalFormSubmissionFieldsFragment,
  ExternalFormSubmissionFilterOptions,
  ExternalFormSubmissionStatus,
  GetProjectExternalFormSubmissionsDocument,
  GetProjectExternalFormSubmissionsQuery,
  GetProjectExternalFormSubmissionsQueryVariables,
  useGetExternalFormDefinitionQuery,
} from '@/types/gqlTypes';

export type ExternalFormSubmissionFields = NonNullable<
  GetProjectExternalFormSubmissionsQuery['project']
>['externalFormSubmissions']['nodes'][number];

const ProjectExternalSubmissionsTable = ({
  projectId,
  formDefinitionIdentifier,
}: {
  projectId: string;
  formDefinitionIdentifier: string;
}) => {
  const { data, loading, error } = useGetExternalFormDefinitionQuery({
    variables: { formDefinitionIdentifier: formDefinitionIdentifier },
    skip: !formDefinitionIdentifier,
  });
  const definition = data?.externalFormDefinition;

  const getColumnDefs = useCallback((rows: ExternalFormSubmissionFields[]) => {
    const customColumns = getCustomDataElementColumns(rows);
    return [
      {
        header: 'Status',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionFieldsFragment) => {
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
        render: (s: ExternalFormSubmissionFieldsFragment) =>
          parseAndFormatDateTime(s.submittedAt),
      },
      ...customColumns,
    ];
  }, []);

  const [selected, setSelected] =
    useState<ExternalFormSubmissionFieldsFragment | null>(null);

  const filters = useFilters({
    type: 'ExternalFormSubmissionFilterOptions',
  });

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <>
      <GenericTableWithData<
        GetProjectExternalFormSubmissionsQuery,
        GetProjectExternalFormSubmissionsQueryVariables,
        ExternalFormSubmissionFields,
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
        handleRowClick={(row) => setSelected(row)}
      />
      {selected && definition && (
        <ExternalSubmissionsViewModal
          selected={selected}
          onClose={() => setSelected(null)}
          definition={definition}
        />
      )}
    </>
  );
};

export default ProjectExternalSubmissionsTable;
